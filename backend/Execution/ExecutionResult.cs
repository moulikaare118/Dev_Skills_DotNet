namespace backend.Execution
{
    public class ExecutionResult
    {
        public bool Success { get; set; }
        public string StandardOutput { get; set; } = string.Empty;
        public string StandardError { get; set; } = string.Empty;
        public int ExitCode { get; set; }
        public int ExecutionTimeMs { get; set; }
        public int MemoryKb { get; set; }
        public string ContainerId { get; set; } = string.Empty;
        public bool TimedOut { get; set; }
        public bool MemoryExceeded { get; set; }
    }
}
