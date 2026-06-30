namespace HON.Academy.DAL.Model;

public class Instructor
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Specialization { get; set; }

    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}