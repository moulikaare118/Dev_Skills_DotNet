namespace HON.Academy.DAL.Model;

public class Instructor
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;

    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}