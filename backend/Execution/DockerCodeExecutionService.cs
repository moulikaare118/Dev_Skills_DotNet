using System.Diagnostics;
using backend.Execution;
using Microsoft.Extensions.Logging;

namespace backend.Execution
{
    public class DockerCodeExecutionService : ICodeExecutionService
    {
        private readonly ILogger<DockerCodeExecutionService> _logger;
        private readonly string _workspaceRoot;
        private const int TimeoutMilliseconds = 15000;
        private const int MemoryLimitMegabytes = 256;

        public DockerCodeExecutionService(ILogger<DockerCodeExecutionService> logger)
        {
            _logger = logger;
            _workspaceRoot = Path.Combine(Path.GetTempPath(), "code_execution");
            Directory.CreateDirectory(_workspaceRoot);
        }

        public async Task<ExecutionResult> RunAsync(string code, string input)
        {
            var executionId = Guid.NewGuid();
            var workspaceDirectory = Path.Combine(_workspaceRoot, executionId.ToString());
            Directory.CreateDirectory(workspaceDirectory);

            try
            {
                await CreateProjectAsync(workspaceDirectory);
                var sourcePath = Path.Combine(workspaceDirectory, "Program.cs");
                await File.WriteAllTextAsync(sourcePath, code);
                _logger.LogInformation("Wrote source for execution {ExecutionId} to {SourcePath}. Code preview:\n{CodePreview}", executionId, sourcePath, code.Length > 512 ? code[..512] + "..." : code);

                var result = await BuildProjectAsync(workspaceDirectory);
                if (!result.Success)
                {
                    _logger.LogWarning("Compilation failed for execution {ExecutionId}: {Error}", executionId, result.StandardError);
                    return result;
                }

                var executeResult = await RunProjectAsync(executionId, workspaceDirectory, input);
                _logger.LogInformation("Execution complete {ExecutionId}: ExitCode={ExitCode} TimeMs={ExecutionTimeMs} MemoryKb={MemoryKb} ContainerId={ContainerId}", executionId, executeResult.ExitCode, executeResult.ExecutionTimeMs, executeResult.MemoryKb, executeResult.ContainerId);
                return executeResult;
            }
            finally
            {
                try
                {
                    Directory.Delete(workspaceDirectory, true);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to clean up workspace {WorkspaceDirectory}", workspaceDirectory);
                }
            }
        }

        private async Task<ExecutionResult> CreateProjectAsync(string workspaceDirectory)
        {
            var startInfo = new ProcessStartInfo("dotnet", "new console --no-restore")
            {
                WorkingDirectory = workspaceDirectory,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false
            };

            var process = Process.Start(startInfo);
            if (process == null)
            {
                return new ExecutionResult
                {
                    Success = false,
                    StandardError = "Failed to create project directory."
                };
            }

            var output = await process.StandardOutput.ReadToEndAsync();
            var error = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                return new ExecutionResult
                {
                    Success = false,
                    StandardError = error
                };
            }

            return new ExecutionResult { Success = true };
        }

        private async Task<ExecutionResult> BuildProjectAsync(string workspaceDirectory)
        {
            var startInfo = new ProcessStartInfo("dotnet", "build")
            {
                WorkingDirectory = workspaceDirectory,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false
            };

            var stopwatch = Stopwatch.StartNew();
            var process = Process.Start(startInfo);
            if (process == null)
            {
                return new ExecutionResult
                {
                    Success = false,
                    StandardError = "Failed to start build process."
                };
            }

            var output = await process.StandardOutput.ReadToEndAsync();
            var error = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();
            stopwatch.Stop();

            _logger.LogInformation("Build output: {Output}", output);

            return new ExecutionResult
            {
                Success = process.ExitCode == 0,
                StandardError = error,
                StandardOutput = output,
                ExecutionTimeMs = (int)stopwatch.ElapsedMilliseconds
            };
        }

        private async Task<ExecutionResult> RunProjectAsync(Guid executionId, string workspaceDirectory, string input)
        {
            var sourceDir = workspaceDirectory;
            var containerName = $"code-exec-{Guid.NewGuid():N}";
            var projectDir = Path.Combine(sourceDir, "bin", "Debug", "net8.0");
            var result = new ExecutionResult();

            if (!Directory.Exists(projectDir))
            {
                var debugDir = Path.Combine(sourceDir, "bin", "Debug");
                if (Directory.Exists(debugDir))
                {
                    var fallbackDir = Directory.GetDirectories(debugDir, "net*").OrderByDescending(Path.GetFileName).FirstOrDefault();
                    if (!string.IsNullOrEmpty(fallbackDir))
                    {
                        projectDir = fallbackDir;
                        _logger.LogInformation("Using fallback project directory for execution {ExecutionId}: {ProjectDir}", executionId, projectDir);
                    }
                }
            }

            if (!Directory.Exists(projectDir))
            {
                return new ExecutionResult
                {
                    Success = false,
                    StandardError = "Compiled project directory not found."
                };
            }

            var dllFile = Directory.GetFiles(projectDir, "*.dll").FirstOrDefault();
            if (string.IsNullOrEmpty(dllFile))
            {
                return new ExecutionResult
                {
                    Success = false,
                    StandardError = "Compiled DLL not found."
                };
            }

            var dllName = Path.GetFileName(dllFile);
            var dockerArgs = new[]
            {
                "run",
                "--rm",
                "--name", containerName,
                "--network", "none",
                "--read-only",
                "--memory", "256m",
                "--cpus", "1",
                "-v", $"{projectDir}:/app:ro",
                "-w", "/app",
                "mcr.microsoft.com/dotnet/runtime:10.0",
                "dotnet",
                $"./{dllName}"
            };
            _logger.LogInformation("Running Docker execution {ExecutionId} with projectDir={ProjectDir} dll={DllName} container={ContainerName}", executionId, projectDir, dllName, containerName);

            var startInfo = new ProcessStartInfo("docker", string.Join(' ', dockerArgs))
            {
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                RedirectStandardInput = true,
                UseShellExecute = false,
            };

            using var process = new Process { StartInfo = startInfo };
            var stopwatch = Stopwatch.StartNew();
            process.Start();

            if (!string.IsNullOrEmpty(input))
            {
                await process.StandardInput.WriteAsync(input);
                await process.StandardInput.FlushAsync();
            }

            var outputTask = process.StandardOutput.ReadToEndAsync();
            var errorTask = process.StandardError.ReadToEndAsync();
            var waitTask = process.WaitForExitAsync();

            var completed = await Task.WhenAny(waitTask, Task.Delay(TimeoutMilliseconds));
            stopwatch.Stop();

            if (completed != waitTask)
            {
                try
                {
                    process.Kill(true);
                }
                catch { }

                return new ExecutionResult
                {
                    Success = false,
                    TimedOut = true,
                    StandardError = "Execution timed out.",
                    ExecutionTimeMs = (int)stopwatch.ElapsedMilliseconds,
                    ContainerId = containerName
                };
            }

            await waitTask;
            var output = await outputTask;
            var error = await errorTask;
            var memoryKb = 0;

            result.Success = process.ExitCode == 0;
            result.StandardOutput = output;
            result.StandardError = error;
            result.ExitCode = process.ExitCode;
            result.ExecutionTimeMs = (int)stopwatch.ElapsedMilliseconds;
            result.MemoryKb = memoryKb;
            result.ContainerId = containerName;
            result.MemoryExceeded = error.Contains("Memory") || error.Contains("Cannot allocate memory", StringComparison.OrdinalIgnoreCase);

            return result;
        }
    }
}
