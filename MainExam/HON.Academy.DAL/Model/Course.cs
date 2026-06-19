namespace HON.Academy.DAL.Model;

public class Course
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public decimal Fee { get; set; }
    public int DurationWeeks { get; set; }
    public byte[]? RowVersion { get; set; }

    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}