namespace backend.DTOs
{
    public class CodeRunResponse
    {
        public bool Success { get; set; }
        public string Output { get; set; } = string.Empty;
        public int ExecutionTimeMs { get; set; }
        public int MemoryKb { get; set; }
        public string Error { get; set; } = string.Empty;
    }
}
