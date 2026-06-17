namespace backend.DTOs
{
    public class CodeSubmitRequest
    {
        public Guid ProblemId { get; set; }
        public Guid UserId { get; set; }
        public string Code { get; set; } = string.Empty;
    }
}
