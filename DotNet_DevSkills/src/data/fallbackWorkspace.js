const mainExamWorkspaceFiles = [
  {
    id: 'model-student',
    name: 'Student.cs',
    path: 'HON.Academy.DAL/Model/Student.cs',
    readOnly: false,
    content: `namespace HON.Academy.DAL.Model
{
    public class Student
    {
        // TODO: Define student properties and navigation collection.
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
    // TODO: Define course properties, concurrency token, and navigation collections.
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
    // TODO: Define assignment properties and relationships.
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
    // TODO: Define result properties and navigation properties.
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
        // TODO: Define top-student projection fields.
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
        // TODO: Add search filter inputs and result collection.
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
using System.Collections.Generic;
using System.Reflection.Emit;
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
        // TODO: Add sanity test coverage.
    }
}`
  }
];

export const honOrdersWorkspaceFiles = [
  {
    id: 'order-predicate-builder',
    name: 'OrderPredicateBuilder.cs',
    path: 'DataAccess/Helper/OrderPredicateBuilder.cs',
    readOnly: false,
    content: ''
  },
  {
    id: 'valid-sku-attribute',
    name: 'ValidSkuAttribute.cs',
    path: 'DataAccess/Validation/ValidSkuAttribute.cs',
    readOnly: false,
    content: ''
  },
  {
    id: 'money-value-object',
    name: 'Money.cs',
    path: 'DataAccess/ValueObject/Money.cs',
    readOnly: false,
    content: ''
  },
  {
    id: 'orders-controller',
    name: 'OrdersController.cs',
    path: 'HONOrdersApp/Controllers/OrdersController.cs',
    readOnly: false,
    content: ''
  },
  {
    id: 'admin-controller',
    name: 'AdminController.cs',
    path: 'HONOrdersApp/Controllers/AdminController.cs',
    readOnly: false,
    content: ''
  },
  {
    id: 'hon-orders-program',
    name: 'Program.cs',
    path: 'HONOrdersApp/Program.cs',
    readOnly: false,
    content: ''
  },
  {
    id: 'money-tests',
    name: 'MoneyAndValidationTests.cs',
    path: 'HONOrders.Tests/MoneyAndValidationTests.cs',
    readOnly: false,
    content: ''
  }
];

export const assessmentWorkspaceFiles = {
  'main-exam': mainExamWorkspaceFiles,
  'hon-orders': honOrdersWorkspaceFiles
};

export const fallbackWorkspaceFiles = mainExamWorkspaceFiles;
