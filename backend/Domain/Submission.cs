using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Domain
{
    public class Submission
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey("Problem")]
        public Guid ProblemId { get; set; }

        public Problem? Problem { get; set; }

        public Guid UserId { get; set; }

        public string Code { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public int PassedCount { get; set; }

        public int TotalCount { get; set; }

        public int ExecutionTimeMs { get; set; }

        public int MemoryKb { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<ExecutionLog> ExecutionLogs { get; set; } = new List<ExecutionLog>();
    }
}
