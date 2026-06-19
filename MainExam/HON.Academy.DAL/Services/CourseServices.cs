using HON.Academy.DAL.Data;
using HON.Academy.DAL.DataTransferObject;
using HON.Academy.DAL.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HON.Academy.DAL.Services
{
    public class CourseServices : ICourseService
    {
        private readonly AppDbContext _context;

        public CourseServices(AppDbContext context)
        {
            _context = context;
        }
        //TODO:Task 1.1
        public async Task<List<StudentPerformanceDTO>> GetTopStudentsAsync()
        {
            // TODO:
            // 1. Query Results and include Student and Assignment → Course navigation properties
            // 2. Group data by Student Name and Course Title and calculate Average Score
            // 3. Project grouped data into StudentPerformanceDTO (method must return StudentPerformanceDTO, not Result entity)
            // 4. Order by AverageScore descending, take top 5, and execute asynchronously
            var topStudents = await _context.Results
                .Include(r => r.Student)
                .Include(r => r.Assignment)
                    .ThenInclude(a => a.Course)
                .GroupBy(r => new { r.Student.Name, r.Assignment.Course.Title })
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
        //TODO:Task 1.2
        public async Task<List<Course>> SearchCoursesAsync(decimal? minFee, decimal? maxFee, int? duration, string specialization, string keyword)
        {
            // TODO:
            // 1. Query Courses and include Enrollments → Instructor navigation properties
            // 2. Apply fee and duration filters only if values are provided
            // 3. Apply keyword filter on Course Title and specialization filter on Instructor
            // 4. Execute query asynchronously and return filtered Course entity list
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

            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(c => c.Title.Contains(keyword) || c.Enrollments.Any(e => e.Instructor.Specialization.Contains(keyword)));
            }

            return await query.ToListAsync();

        }
    }
}
