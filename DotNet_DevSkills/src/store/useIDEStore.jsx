import create from 'zustand';

const initialFiles = [
  {
    id: 'solution',
    name: 'HON.Academy.sln',
    path: 'HON.Academy.sln',
    readOnly: true,
    content: `Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
VisualStudioVersion = 17.12.35527.113
MinimumVisualStudioVersion = 10.0.40219.1
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "HON.Academy.DAL", "HON.Academy.DAL\\HON.Academy.DAL.csproj", "{B024A0F5-86AD-4DAD-BCED-64A33207C3A9}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "HON.Academy.Web", "HON.Academy.Web\\HON.Academy.Web.csproj", "{1B8582A2-62F8-47A2-BC49-CF4E33C82C32}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "HON.Academy.XunitTests", "HON.Academy.XunitTests\\HON.Academy.XunitTests.csproj", "{3D17E952-17A3-4173-853E-690679205CD4}"
EndProject`
  },
  {
    id: 'model-student',
    name: 'Student.cs',
    path: 'HON.Academy.DAL/Model/Student.cs',
    readOnly: false,
    content: `namespace HON.Academy.DAL.Model
{
    public class Student
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime EnrollmentDate { get; set; }

        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    }
}`
  },
  {
    id: 'model-course',
    name: 'Course.cs',
    path: 'HON.Academy.DAL/Model/Course.cs',
    readOnly: false,
    content: `namespace HON.Academy.DAL.Model;

public class Course
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public decimal Fee { get; set; }
    public int DurationWeeks { get; set; }
    public byte[]? RowVersion { get; set; }

    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}`
  },
  {
    id: 'model-assignment',
    name: 'Assignment.cs',
    path: 'HON.Academy.DAL/Model/Assignment.cs',
    readOnly: false,
    content: `namespace HON.Academy.DAL.Model;

public class Assignment
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int MaxScore { get; set; }

    public Course? Course { get; set; }
    public ICollection<Result> Results { get; set; } = new List<Result>();
}`
  },
  {
    id: 'model-result',
    name: 'Result.cs',
    path: 'HON.Academy.DAL/Model/Result.cs',
    readOnly: false,
    content: `namespace HON.Academy.DAL.Model;

public class Result
{
    public int Id { get; set; }
    public int AssignmentId { get; set; }
    public int StudentId { get; set; }
    public int Score { get; set; }

    public Assignment? Assignment { get; set; }
    public Student? Student { get; set; }
}`
  },
  {
    id: 'dto-studentperformance',
    name: 'StudentPerformanceDTO.cs',
    path: 'HON.Academy.DAL/DataTransferObject/StudentPerformanceDTO.cs',
    readOnly: false,
    content: `namespace HON.Academy.DAL.DataTransferObject
{
    public class StudentPerformanceDTO
    {
        public string StudentName { get; set; } = string.Empty;
        public string CourseTitle { get; set; } = string.Empty;
        public double AverageScore { get; set; }
    }
}`
  },
  {
    id: 'dto-course',
    name: 'CourseDTO.cs',
    path: 'HON.Academy.DAL/DataTransferObject/CourseDTO.cs',
    readOnly: false,
    content: `using HON.Academy.DAL.Model;

namespace HON.Academy.DAL.DataTransferObject
{
    public class CourseDTO
    {
        public decimal? MinFee { get; set; }
        public decimal? MaxFee { get; set; }
        public int? Duration { get; set; }
        public string Specialization { get; set; } = string.Empty;
        public string TitleKeyword { get; set; } = string.Empty;

        public List<Course> Results { get; set; } = new List<Course>();
    }
}`
  },
  {
    id: 'data-appdbcontext',
    name: 'AppDbContext.cs',
    path: 'HON.Academy.DAL/Data/AppDbContext.cs',
    readOnly: false,
    content: `using HON.Academy.DAL.Model;
using Microsoft.EntityFrameworkCore;

namespace HON.Academy.DAL.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Instructor> Instructors => Set<Instructor>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<Result> Results => Set<Result>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseSqlite("Data Source=HONAcademyDB.db");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // TODO: Task 2.1 - Configure EF Core model relationships and constraints
        // - Add unique index on Course.Code
        // - Add check constraint on Enrollment.CompletionPercent (0-100)
        // - Configure relationships: Enrollment->Student, Enrollment->Course, Enrollment->Instructor
        // - Configure relationships: Assignment->Course, Result->Assignment
    }
}`
  },
  {
    id: 'service-icourseservice',
    name: 'ICourseService.cs',
    path: 'HON.Academy.DAL/Services/ICourseService.cs',
    readOnly: false,
    content: `using HON.Academy.DAL.DataTransferObject;
using HON.Academy.DAL.Model;

namespace HON.Academy.DAL.Services
{
    public interface ICourseService
    {
        Task<List<StudentPerformanceDTO>> GetTopStudentsAsync();
        Task<List<Course>> SearchCoursesAsync(decimal? minFee, decimal? maxFee, int? duration, string specialization, string keyword);
    }
}`
  },
  {
    id: 'service-courseservice',
    name: 'CourseServices.cs',
    path: 'HON.Academy.DAL/Services/CourseServices.cs',
    readOnly: false,
    content: `using HON.Academy.DAL.Data;
using HON.Academy.DAL.DataTransferObject;
using HON.Academy.DAL.Model;
using Microsoft.EntityFrameworkCore;

namespace HON.Academy.DAL.Services
{
    // TODO:Task 1.1 & 1.2 - Implement course query services
    public class CourseServices : ICourseService
    {
        private readonly AppDbContext _context;

        public CourseServices(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<StudentPerformanceDTO>> GetTopStudentsAsync()
        {
            // TODO: Task 1.1 - Query Results, group by Student+Course, calculate average score, return top 5
            throw new NotImplementedException();
        }

        public async Task<List<Course>> SearchCoursesAsync(decimal? minFee, decimal? maxFee, int? duration, string specialization, string keyword)
        {
            // TODO: Task 1.2 - Query Courses, apply optional filters (minFee, maxFee, duration, keyword, specialization)
            throw new NotImplementedException();
        }
    }
}`
  },
  {
    id: 'web-coursecontroller',
    name: 'CourseController.cs',
    path: 'HON.Academy.Web/Controllers/CourseController.cs',
    readOnly: false,
    content: `using HON.Academy.DAL.DataTransferObject;
using HON.Academy.DAL.Services;
using Microsoft.AspNetCore.Mvc;

namespace HON.Academy.Web.Controllers
{
    public class CourseController : Controller
    {
        private readonly ICourseService _service;

        // TODO: Task 3.1 - Implement constructor injection
        public CourseController(ICourseService service)
        {
            throw new NotImplementedException();
        }

        // TODO: Task 3.2 - Implement TopStudents action to return top students view
        [HttpGet]
        public async Task<IActionResult> TopStudents()
        {
            throw new NotImplementedException();
        }

        // TODO: Task 3.3 - Implement Course search with GET (display form) and POST (search)
        [HttpGet]
        public IActionResult Search()
        {
            throw new NotImplementedException();
        }

        [HttpPost]
        public async Task<IActionResult> Search(CourseDTO vm)
        {
            throw new NotImplementedException();
        }
    }
}`
  },
  {
    id: 'web-program',
    name: 'Program.cs',
    path: 'HON.Academy.Web/Program.cs',
    readOnly: false,
    content: `using HON.Academy.DAL.Data;
using HON.Academy.DAL.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

// TODO: Task 2.2 - Register ICourseService and CourseServices with dependency injection
// builder.Services.AddScoped<ICourseService, CourseServices>();

// TODO: Task 2.3 - Configure DbContext with SQLite provider
// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseSqlite("Data Source=HONAcademyDB.db"));

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();`
  },
  {
    id: 'test-sampletests',
    name: 'SampleTests.cs',
    path: 'HON.Academy.XunitTests/SampleTests.cs',
    readOnly: false,
    content: `using Xunit;

namespace HON.Academy.XunitTests
{
    public class SampleTests
    {
        [Fact]
        public void Sanity()
        {
            Assert.True(true);
        }
    }
}`
  },
  {
    id: 'test-courseservicestests',
    name: 'CourseServicesTests.cs',
    path: 'HON.Academy.XunitTests/CourseServicesTests.cs',
    readOnly: false,
    content: `using HON.Academy.DAL.Data;
using HON.Academy.DAL.Model;
using HON.Academy.DAL.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

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
            var student = new Student { Id = 1, Name = "Alice", Email = "a@x.com", EnrollmentDate = DateTime.UtcNow };
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
            
            var enrollment = new Enrollment { Id = 100, StudentId = 1, CourseId = course1.Id, InstructorId = instructor.Id, Status = "Active", CompletionPercent = 0, EnrolledOn = DateTime.UtcNow };
            context.Enrollments.Add(enrollment);
            context.SaveChanges();

            var svc = new CourseServices(context);
            var results = await svc.SearchCoursesAsync(minFee: 4000m, maxFee: null, duration: 6, specialization: "Dot Net", keyword: "ASP.NET");

            Assert.NotNull(results);
            Assert.Contains(results, c => c.Id == course1.Id);
        }
    }
}`
  },
  {
    id: 'readme',
    name: 'README.md',
    path: 'README.md',
    readOnly: true,
    content: `# MainExam: E-Learning Course Management Platform

## Overview
A comprehensive ASP.NET Core MVC application for managing courses, students, assignments, and performance analytics.

## Projects
- **HON.Academy.DAL**: Data Access Layer with Entity Framework Core, models, and services
- **HON.Academy.Web**: ASP.NET Core MVC web application with controllers and views
- **HON.Academy.XunitTests**: Unit tests for services and business logic

## Tasks
- Task 1.1: Implement GetTopStudentsAsync() - Returns top 5 students by average score per course
- Task 1.2: Implement SearchCoursesAsync() - Search courses by fee range, duration, keyword, and specialization
- Task 3.1: Dependency Injection in CourseController constructor
- Task 3.2: TopStudents action - Display top-performing students
- Task 3.3: Course search (GET/POST) - Search and filter available courses

## Running Tests
\`\`\`bash
dotnet test HON.Academy.sln
\`\`\`

## Building & Running
\`\`\`bash
dotnet build HON.Academy.sln
dotnet run --project HON.Academy.Web
\`\`\``
  }
];

const useIDEStore = create((set) => ({
  activeFileId: 'web-program',
  files: initialFiles,
  activeOutputTab: 'output',
  activeRightTab: 'problem',
  outputLines: ['Ready to run your code.'],
  testLines: ['Test runner is ready.'],
  submissionLines: [],
  unsavedChanges: false,
  fullscreen: false,
  timerSeconds: 4500,
  setActiveFile: (id) => set({ activeFileId: id }),
  updateFileContent: (id, content) =>
    set((state) => ({
      files: state.files.map((file) => (file.id === id ? { ...file, content } : file)),
      unsavedChanges: true
    })),
  setActiveOutputTab: (tab) => set({ activeOutputTab: tab }),
  setActiveRightTab: (tab) => set({ activeRightTab: tab }),
  setOutputLines: (lines) => set({ outputLines: lines }),
  setTestLines: (lines) => set({ testLines: lines }),
  setSubmissionLines: (lines) => set({ submissionLines: lines }),
  toggleFullscreen: () => set((state) => ({ fullscreen: !state.fullscreen })),
  saveChanges: () => set({ unsavedChanges: false }),
  resetEditor: () => set({ files: initialFiles, activeFileId: 'web-program', unsavedChanges: false }),
  refreshFiles: () => set({ files: initialFiles, outputLines: ['File tree refreshed.'], unsavedChanges: false })
}));

export default useIDEStore;
