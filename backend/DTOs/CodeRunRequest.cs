namespace backend.DTOs
{
    public class CodeRunRequest
    {
        public Guid ProblemId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string CustomInput { get; set; } = string.Empty;
    }
}
