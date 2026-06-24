namespace HON.Academy.DAL.Model;

public class Course
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Code { get; set; }
    public decimal Fee { get; set; }
    public int DurationWeeks { get; set; }
    public byte[]? RowVersion { get; set; }

    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}