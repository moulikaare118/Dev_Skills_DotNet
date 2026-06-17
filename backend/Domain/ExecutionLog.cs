using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Domain
{
    public class ExecutionLog
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey("Submission")]
        public Guid SubmissionId { get; set; }

        public Submission? Submission { get; set; }

        [ForeignKey("TestCase")]
        public Guid TestCaseId { get; set; }

        public TestCase? TestCase { get; set; }

        public string ActualOutput { get; set; } = string.Empty;

        public string ExpectedOutput { get; set; } = string.Empty;

        public bool Passed { get; set; }

        public int ExecutionTimeMs { get; set; }
    }
}
