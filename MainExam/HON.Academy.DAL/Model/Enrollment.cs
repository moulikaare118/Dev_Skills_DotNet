

namespace HON.Academy.DAL.Model;

public class Enrollment
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public int CourseId { get; set; }
    public int InstructorId { get; set; }
    public DateTime EnrolledOn { get; set; }
    public string Status { get; set; } = string.Empty;
    public int CompletionPercent { get; set; }

    public Student? Student { get; set; }
    public Course? Course { get; set; }
    public Instructor? Instructor { get; set; }
}