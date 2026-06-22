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
        }
        //TODO:Task 1.2
        public async Task<List<Course>> SearchCoursesAsync(decimal? minFee, decimal? maxFee, int? duration, string specialization, string keyword)
        {
            // TODO:
            // 1. Query Courses and include Enrollments → Instructor navigation properties
            // 2. Apply fee and duration filters only if values are provided
            // 3. Apply keyword filter on Course Title and specialization filter on Instructor
            // 4. Execute query asynchronously and return filtered Course entity list
            

        }
    }
}
