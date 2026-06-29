using HON.Academy.DAL.Data;
using HON.Academy.DAL.DataTransferObject;
using HON.Academy.DAL.Model;
using Microsoft.EntityFrameworkCore;

namespace HON.Academy.DAL.Services
{
    #pragma warning disable CS8602
    public class CourseServices : ICourseService
    {
        private readonly AppDbContext _context;

        public CourseServices(AppDbContext context)
        {
            _context = context;
        }

        // Implements Task 1.1: Get top 5 students by average score per course
        // Description: Queries Results including Student and Assignment->Course,
        // groups by student and course, computes average score, projects to StudentPerformanceDTO,
        // orders by average descending and returns top 5.
        public async Task<List<StudentPerformanceDTO>> GetTopStudentsAsync()
        {
            var topStudents = await _context.Results
                .Include(r => r.Student)
                .Include(r => r.Assignment)
                    .ThenInclude(a => a.Course)
                .Where(r => r.Student != null && r.Assignment != null && r.Assignment.Course != null)
                .GroupBy(r => new { Name = r.Student == null ? string.Empty : r.Student.Name, Title = r.Assignment == null || r.Assignment.Course == null ? string.Empty : r.Assignment.Course.Title })
                .Select(g => new StudentPerformanceDTO
                {
                    StudentName = g.Key.Name,
                    CourseTitle = g.Key.Title,
                    AverageScore = g.Average(r => r.Score)
                })
                .OrderByDescending(dto => dto.AverageScore)
                .Take(5)
                .ToListAsync();

            return topStudents;
        }

        // Implements Task 1.2: Course search with optional filters
        // Description: Queries Courses including Enrollments->Instructor and applies optional filters
        // (minFee, maxFee, duration, specialization, keyword) before returning matching Course entities.
        public async Task<List<Course>> SearchCoursesAsync(decimal? minFee, decimal? maxFee, int? duration, string specialization, string keyword)
        {
            var query = _context.Courses
                .Include(c => c.Enrollments)
                    .ThenInclude(e => e.Instructor)
                .AsQueryable();

            if (minFee.HasValue)
            {
                query = query.Where(c => c.Fee >= minFee.Value);
            }

            if (maxFee.HasValue)
            {
                query = query.Where(c => c.Fee <= maxFee.Value);
            }

            if (duration.HasValue)
            {
                query = query.Where(c => c.DurationWeeks == duration.Value);
            }

            if (!string.IsNullOrWhiteSpace(specialization))
            {
                query = query.Where(c => c.Enrollments.Any(e => e.Instructor != null && e.Instructor.Specialization.Contains(specialization)));
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(c => c.Title.Contains(keyword));
            }

            return await query.ToListAsync();

        }
    }
}
    #pragma warning restore CS8602
