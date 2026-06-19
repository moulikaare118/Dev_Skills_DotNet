

namespace HON.Academy.DAL.Model;

public class Assignment
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int MaxScore { get; set; }

    public Course? Course { get; set; }
    public ICollection<Result> Results { get; set; } = new List<Result>();
}