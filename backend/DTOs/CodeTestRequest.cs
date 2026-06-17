namespace backend.DTOs
{
    public class CodeTestRequest
    {
        public Guid ProblemId { get; set; }
        public string Code { get; set; } = string.Empty;
    }
}
