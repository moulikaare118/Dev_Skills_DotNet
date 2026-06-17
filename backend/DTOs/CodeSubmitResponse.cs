namespace backend.DTOs
{
    public class CodeSubmitResponse
    {
        public string Status { get; set; } = string.Empty;
        public int Passed { get; set; }
        public int Total { get; set; }
        public int ExecutionTimeMs { get; set; }
        public int MemoryKb { get; set; }
    }
}
