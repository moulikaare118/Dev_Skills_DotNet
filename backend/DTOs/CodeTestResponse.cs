namespace backend.DTOs
{
    public class CodeTestResponse
    {
        public int Passed { get; set; }
        public int Total { get; set; }
        public IEnumerable<TestCaseResult> Results { get; set; } = Array.Empty<TestCaseResult>();
    }

    public class TestCaseResult
    {
        public Guid TestCaseId { get; set; }
        public bool Passed { get; set; }
        public string ActualOutput { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
        public int ExecutionTimeMs { get; set; }
    }
}
