using System.ComponentModel.DataAnnotations;

namespace backend.Domain
{
    public class Problem
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Difficulty { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<TestCase> TestCases { get; set; } = new List<TestCase>();
    }
}
