using HON.Academy.DAL.Data;
using HON.Academy.DAL.Model;
using HON.Academy.DAL.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;
using System.Linq;
using System.Threading.Tasks;

namespace HON.Academy.XunitTests
{
    public class CourseServicesTests
    {
        private AppDbContext CreateContext(string databaseName)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: databaseName)
                .Options;

            return new AppDbContext(options);
        }

        [Fact]
        public async Task GetTopStudentsAsync_Returns_TopStudentEntry()
        {
            using var context = CreateContext(nameof(GetTopStudentsAsync_Returns_TopStudentEntry));
            var student = new Student { Id = 1, Name = "Alice", Email = "alice@example.com", EnrollmentDate = System.DateTime.UtcNow };
            var course = new Course { Id = 1, Title = "Math", Code = "M01", Fee = 100m, DurationWeeks = 4 };
            var assignment = new Assignment { Id = 1, CourseId = course.Id, Title = "Exam", MaxScore = 100, Course = course };
            var result = new Result { Id = 1, AssignmentId = assignment.Id, StudentId = student.Id, Score = 95, Assignment = assignment, Student = student };

            context.Students.Add(student);
            context.Courses.Add(course);
            context.Assignments.Add(assignment);
            context.Results.Add(result);
            await context.SaveChangesAsync();

            var service = new CourseServices(context);
            var topStudents = await service.GetTopStudentsAsync();

            Assert.NotNull(topStudents);
            Assert.Single(topStudents);
            Assert.Equal("Alice", topStudents.First().StudentName);
            Assert.Equal("Math", topStudents.First().CourseTitle);
            Assert.Equal(95d, topStudents.First().AverageScore);
        }

        [Fact]
        public async Task SearchCoursesAsync_Filters_ByFeeDurationKeywordAndSpecialization()
        {
            using var context = CreateContext(nameof(SearchCoursesAsync_Filters_ByFeeDurationKeywordAndSpecialization));
            var instructor = new Instructor { Id = 1, Name = "Dr. X", Email = "x@x.com", Specialization = "Dot Net" };
            var course1 = new Course { Id = 10, Title = "ASP.NET Core", Code = "NET01", Fee = 5000m, DurationWeeks = 6 };
            var course2 = new Course { Id = 11, Title = "Angular Basics", Code = "ANG01", Fee = 3000m, DurationWeeks = 4 };
            var enrollment = new Enrollment
            {
                Id = 100,
                StudentId = 1,
                CourseId = course1.Id,
                InstructorId = instructor.Id,
                Status = "Active",
                CompletionPercent = 0,
                EnrolledOn = System.DateTime.UtcNow,
                Course = course1,
                Instructor = instructor
            };

            context.Instructors.Add(instructor);
            context.Courses.AddRange(course1, course2);
            context.Enrollments.Add(enrollment);
            await context.SaveChangesAsync();

            var service = new CourseServices(context);
            var results = await service.SearchCoursesAsync(4000m, null, 6, "Dot Net", "ASP.NET");

            Assert.NotNull(results);
            Assert.Contains(results, c => c.Id == course1.Id);
            Assert.DoesNotContain(results, c => c.Id == course2.Id);
        }

        [Fact]
        public async Task SearchCoursesAsync_NullFilters_ReturnsAllCourses()
        {
            using var context = CreateContext(nameof(SearchCoursesAsync_NullFilters_ReturnsAllCourses));
            var courseA = new Course { Id = 21, Title = "One", Code = "O1", Fee = 100m, DurationWeeks = 2 };
            var courseB = new Course { Id = 22, Title = "Two", Code = "T2", Fee = 200m, DurationWeeks = 4 };

            context.Courses.AddRange(courseA, courseB);
            await context.SaveChangesAsync();

            var service = new CourseServices(context);
            var results = await service.SearchCoursesAsync(null, null, null, string.Empty, string.Empty);

            Assert.NotNull(results);
            Assert.Equal(2, results.Count);
        }
    }
}
