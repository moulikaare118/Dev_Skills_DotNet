

namespace HON.Academy.DAL.Model;

public class Result
{
    public int Id { get; set; }
    public int AssignmentId { get; set; }
    public int StudentId { get; set; }
    public int Score { get; set; }

    public Assignment Assignment { get; set; }
    public Student Student { get; set; }
}