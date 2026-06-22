using HON.Academy.DAL.Data;
using HON.Academy.DAL.Model;
using HON.Academy.DAL.Services;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Xunit;
using System.Linq;
using HON.Academy.DAL.DataTransferObject;
using System.Collections.Generic;

namespace HON.Academy.XunitTests
{
    public class CourseServicesTests
    {
        private AppDbContext CreateContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            return new AppDbContext(options);
        }

        [Fact]
        public async Task GetTopStudentsAsync_Returns_TopStudentEntry()
        {
            using var context = CreateContext(nameof(GetTopStudentsAsync_Returns_TopStudentEntry));
            var student = new Student { Id = 1, Name = "Alice", Email = "a@x.com", EnrollmentDate = System.DateTime.UtcNow };
            var course = new Course { Id = 1, Title = "Math", Code = "M01", Fee = 100, DurationWeeks = 4 };
            var assignment = new Assignment { Id = 1, CourseId = course.Id, Title = "Exam", MaxScore = 100 };

            context.Students.Add(student);
            context.Courses.Add(course);
            context.Assignments.Add(assignment);
            context.Results.Add(new Result { Id = 1, AssignmentId = assignment.Id, StudentId = student.Id, Score = 95 });
            context.SaveChanges();

            var svc = new CourseServices(context);
            var top = await svc.GetTopStudentsAsync();

            Assert.NotNull(top);
            Assert.True(top.Count >= 1);
            var first = top.First();
            Assert.Equal("Alice", first.StudentName);
            Assert.Equal("Math", first.CourseTitle);
            Assert.Equal(95d, first.AverageScore);
        }

        [Fact]
        public async Task SearchCoursesAsync_Filters_ByFeeDurationKeywordAndSpecialization()
        {
            using var context = CreateContext(nameof(SearchCoursesAsync_Filters_ByFeeDurationKeywordAndSpecialization));
            var instructor = new Instructor { Id = 1, Name = "Dr. X", Email = "x@x.com", Specialization = "Dot Net" };
            context.Instructors.Add(instructor);
            var course1 = new Course { Id = 10, Title = "ASP.NET Core", Code = "NET01", Fee = 5000m, DurationWeeks = 6 };
            var course2 = new Course { Id = 11, Title = "Angular Basics", Code = "ANG01", Fee = 3000m, DurationWeeks = 4 };
            context.Courses.AddRange(course1, course2);
            var enrollment = new Enrollment { Id = 100, StudentId = 1, CourseId = course1.Id, InstructorId = instructor.Id, Status = "Active", CompletionPercent = 0, EnrolledOn = System.DateTime.UtcNow };
            context.Enrollments.Add(enrollment);

            context.SaveChanges();

            var svc = new CourseServices(context);
            var results = await svc.SearchCoursesAsync(minFee: 4000m, maxFee: null, duration: 6, specialization: "Dot Net", keyword: "ASP.NET");

            Assert.NotNull(results);
            Assert.Contains(results, c => c.Id == course1.Id);
            Assert.DoesNotContain(results, c => c.Id == course2.Id);
        }

        [Fact]
        public async Task GetTopStudentsAsync_NoResults_ReturnsEmptyList()
        {
            using var context = CreateContext(nameof(GetTopStudentsAsync_NoResults_ReturnsEmptyList));
            var svc = new CourseServices(context);
            var top = await svc.GetTopStudentsAsync();
            Assert.NotNull(top);
            Assert.Empty(top);
        }

        [Fact]
        public async Task GetTopStudentsAsync_TieScores_ReturnsBothStudents()
        {
            using var context = CreateContext(nameof(GetTopStudentsAsync_TieScores_ReturnsBothStudents));
            var s1 = new Student { Id = 21, Name = "S1", Email = "s1@x.com", EnrollmentDate = System.DateTime.UtcNow };
            var s2 = new Student { Id = 22, Name = "S2", Email = "s2@x.com", EnrollmentDate = System.DateTime.UtcNow };
            var course = new Course { Id = 30, Title = "History", Code = "H01", Fee = 100, DurationWeeks = 2 };
            var assignment1 = new Assignment { Id = 201, CourseId = course.Id, Title = "A1", MaxScore = 100 };
            var assignment2 = new Assignment { Id = 202, CourseId = course.Id, Title = "A2", MaxScore = 100 };

            context.Students.AddRange(s1, s2);
            context.Courses.Add(course);
            context.Assignments.AddRange(assignment1, assignment2);
            context.Results.AddRange(
                new Result { Id = 301, AssignmentId = assignment1.Id, StudentId = s1.Id, Score = 80 },
                new Result { Id = 302, AssignmentId = assignment2.Id, StudentId = s1.Id, Score = 90 },
                new Result { Id = 303, AssignmentId = assignment1.Id, StudentId = s2.Id, Score = 85 },
                new Result { Id = 304, AssignmentId = assignment2.Id, StudentId = s2.Id, Score = 85 }
            );
            context.SaveChanges();

            var svc = new CourseServices(context);
            var top = await svc.GetTopStudentsAsync();
            Assert.True(top.Count >= 2);
            var names = top.Select(t => t.StudentName).ToList();
            Assert.Contains("S1", names);
            Assert.Contains("S2", names);
        }

        [Fact]
        public async Task SearchCoursesAsync_NoMatches_ReturnsEmpty()
        {
            using var context = CreateContext(nameof(SearchCoursesAsync_NoMatches_ReturnsEmpty));
            var c1 = new Course { Id = 41, Title = "Alpha", Code = "A1", Fee = 100m, DurationWeeks = 1 };
            context.Courses.Add(c1);
            context.SaveChanges();

            var svc = new CourseServices(context);
            var res = await svc.SearchCoursesAsync(minFee: 1000m, maxFee: null, duration: null, specialization: "", keyword: "");
            Assert.NotNull(res);
            Assert.Empty(res);
        }

        [Fact]
        public async Task SearchCoursesAsync_MinGreaterThanMax_ReturnsEmpty()
        {
            using var context = CreateContext(nameof(SearchCoursesAsync_MinGreaterThanMax_ReturnsEmpty));
            var c1 = new Course { Id = 51, Title = "Beta", Code = "B1", Fee = 200m, DurationWeeks = 3 };
            context.Courses.Add(c1);
            context.SaveChanges();

            var svc = new CourseServices(context);
            var res = await svc.SearchCoursesAsync(minFee: 500m, maxFee: 100m, duration: null, specialization: "", keyword: "");
            Assert.NotNull(res);
            Assert.Empty(res);
        }

        [Fact]
        public async Task SearchCoursesAsync_NullFilters_ReturnsAll()
        {
            using var context = CreateContext(nameof(SearchCoursesAsync_NullFilters_ReturnsAll));
            var c1 = new Course { Id = 61, Title = "One", Code = "O1", Fee = 10m, DurationWeeks = 1 };
            var c2 = new Course { Id = 62, Title = "Two", Code = "T1", Fee = 20m, DurationWeeks = 2 };
            context.Courses.AddRange(c1, c2);
            context.SaveChanges();

            var svc = new CourseServices(context);
            var res = await svc.SearchCoursesAsync(minFee: null, maxFee: null, duration: null, specialization: "", keyword: "");
            Assert.NotNull(res);
            Assert.Equal(2, res.Count);
        }
    }
}
