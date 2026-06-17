using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Domain
{
    public class TestCase
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey("Problem")]
        public Guid ProblemId { get; set; }

        public Problem? Problem { get; set; }

        public string Input { get; set; } = string.Empty;

        public string ExpectedOutput { get; set; } = string.Empty;

        public bool IsHidden { get; set; }

        public int Weight { get; set; } = 1;
    }
}
