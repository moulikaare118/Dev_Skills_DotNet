using backend.DTOs;
using backend.Domain;
using backend.Execution;
using backend.Repositories;
using backend.Utilities;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    public class EvaluationService : IEvaluationService
    {
        private readonly IProblemService _problemService;
        private readonly ITestCaseService _testCaseService;
        private readonly ISubmissionService _submissionService;
        private readonly IExecutionLogRepository _executionLogRepository;
        private readonly ICodeExecutionService _executionService;
        private readonly ILogger<EvaluationService> _logger;

        public EvaluationService(
            IProblemService problemService,
            ITestCaseService testCaseService,
            ISubmissionService submissionService,
            IExecutionLogRepository executionLogRepository,
            ICodeExecutionService executionService,
            ILogger<EvaluationService> logger)
        {
            _problemService = problemService;
            _testCaseService = testCaseService;
            _submissionService = submissionService;
            _executionLogRepository = executionLogRepository;
            _executionService = executionService;
            _logger = logger;
        }

        public async Task<CodeRunResponse> RunCustomCodeAsync(Guid problemId, string code, string input)
        {
            var result = await _executionService.RunAsync(code, input);
            return new CodeRunResponse
            {
                Success = result.Success,
                Output = result.StandardOutput.TrimEnd(),
                ExecutionTimeMs = result.ExecutionTimeMs,
                MemoryKb = result.MemoryKb,
                Error = result.StandardError.TrimEnd()
            };
        }

        public async Task<CodeTestResponse> RunVisibleTestsAsync(Guid problemId, string code)
        {
            var problem = await _problemService.GetProblemAsync(problemId);
            if (problem is null)
            {
                return new CodeTestResponse { Passed = 0, Total = 0 };
            }

            var testCases = await _testCaseService.GetVisibleTestCasesAsync(problemId);
            return await EvaluateTestCasesAsync(testCases, code);
        }

        public async Task<CodeSubmitResponse> SubmitSolutionAsync(Guid problemId, Guid userId, string code)
        {
            var problem = await _problemService.GetProblemAsync(problemId);
            if (problem is null)
            {
                return new CodeSubmitResponse { Status = "Problem Not Found", Passed = 0, Total = 0, ExecutionTimeMs = 0, MemoryKb = 0 };
            }

            var hiddenTestCases = await _testCaseService.GetHiddenTestCasesAsync(problemId);
            var evaluation = await EvaluateSubmissionAsync(problemId, hiddenTestCases, code);
            var submission = new Submission
            {
                Id = Guid.NewGuid(),
                ProblemId = problemId,
                UserId = userId,
                Code = code,
                Status = evaluation.Status,
                PassedCount = evaluation.Passed,
                TotalCount = evaluation.Total,
                ExecutionTimeMs = evaluation.ExecutionTimeMs,
                MemoryKb = evaluation.MemoryKb,
                CreatedAt = DateTime.UtcNow
            };

            await _submissionService.RecordSubmissionAsync(submission);
            return evaluation;
        }

        private async Task<CodeTestResponse> EvaluateTestCasesAsync(List<TestCase> testCases, string code)
        {
            var response = new CodeTestResponse
            {
                Results = new List<TestCaseResult>()
            };

            foreach (var testCase in testCases)
            {
                var executionResult = await _executionService.RunAsync(code, testCase.Input);
                var passed = executionResult.Success && OutputComparer.AreEqual(testCase.ExpectedOutput, executionResult.StandardOutput);
                response.Results = response.Results.Append(new TestCaseResult
                {
                    TestCaseId = testCase.Id,
                    Passed = passed,
                    ActualOutput = executionResult.StandardOutput.TrimEnd(),
                    ExpectedOutput = testCase.ExpectedOutput.TrimEnd(),
                    ExecutionTimeMs = executionResult.ExecutionTimeMs
                });

                if (passed)
                {
                    response.Passed++;
                }
            }

            response.Total = testCases.Count;
            return response;
        }

        private async Task<CodeSubmitResponse> EvaluateSubmissionAsync(Guid problemId, List<TestCase> testCases, string code)
        {
            var passed = 0;
            var totalTime = 0;
            var maxMemory = 0;
            var verdict = "Accepted";

            foreach (var testCase in testCases)
            {
                var executionResult = await _executionService.RunAsync(code, testCase.Input);
                totalTime += executionResult.ExecutionTimeMs;
                maxMemory = Math.Max(maxMemory, executionResult.MemoryKb);
                var passedTest = executionResult.Success && OutputComparer.AreEqual(testCase.ExpectedOutput, executionResult.StandardOutput);

                if (!executionResult.Success)
                {
                    verdict = DetermineErrorStatus(executionResult);
                }
                else if (!passedTest && verdict == "Accepted")
                {
                    verdict = "Wrong Answer";
                }

                if (passedTest)
                {
                    passed++;
                }

                await _executionLogRepository.AddAsync(new ExecutionLog
                {
                    Id = Guid.NewGuid(),
                    SubmissionId = Guid.Empty,
                    TestCaseId = testCase.Id,
                    ActualOutput = executionResult.StandardOutput.TrimEnd(),
                    ExpectedOutput = testCase.ExpectedOutput.TrimEnd(),
                    Passed = passedTest,
                    ExecutionTimeMs = executionResult.ExecutionTimeMs
                });

                if (!executionResult.Success && verdict != "Accepted")
                {
                    break;
                }
            }

            return new CodeSubmitResponse
            {
                Status = verdict,
                Passed = passed,
                Total = testCases.Count,
                ExecutionTimeMs = totalTime,
                MemoryKb = maxMemory
            };
        }

        private static string DetermineErrorStatus(ExecutionResult executionResult)
        {
            if (executionResult.TimedOut)
            {
                return "Time Limit Exceeded";
            }

            if (executionResult.MemoryExceeded)
            {
                return "Memory Limit Exceeded";
            }

            if (executionResult.ExitCode != 0)
            {
                return "Runtime Error";
            }

            return "Compilation Error";
        }
    }
}
