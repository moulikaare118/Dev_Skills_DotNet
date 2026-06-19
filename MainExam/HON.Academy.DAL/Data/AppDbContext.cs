using HON.Academy.DAL.Model;
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
        // ⭐ Unique course code
        modelBuilder.Entity<Course>()
            .HasIndex(c => c.Code)
            .IsUnique();



        // ⭐ Completion constraint
        modelBuilder.Entity<Enrollment>()
            .ToTable(tb => tb.HasCheckConstraint("CK_Completion", "[CompletionPercent] BETWEEN 0 AND 100"));


        // ⭐ Relationships (Many-to-many with metadata)
        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.Student)
            .WithMany(s => s.Enrollments)
            .HasForeignKey(e => e.StudentId);

        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.Course)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(e => e.CourseId);

        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.Instructor)
            .WithMany(i => i.Enrollments)
            .HasForeignKey(e => e.InstructorId);

        modelBuilder.Entity<Assignment>()
            .HasOne(a => a.Course)
            .WithMany(c => c.Assignments)
            .HasForeignKey(a => a.CourseId);

        modelBuilder.Entity<Result>()
            .HasOne(r => r.Assignment)
            .WithMany(a => a.Results)
            .HasForeignKey(r => r.AssignmentId);

        // ⭐ Seed data
        modelBuilder.Entity<Student>().HasData(
            new Student { Id = 1, Name = "Student-1", Email = "s1@gmail.com", EnrollmentDate = new DateTime(2024, 1, 1) }
        );

        modelBuilder.Entity<Instructor>().HasData(
            new Instructor { Id = 1, Name = "Instructor-A", Email = "a@gmail.com", Specialization = "Dot Net" }
        );

        modelBuilder.Entity<Course>().HasData(
            new Course { Id = 1, Title = "ASP.NET Core", Code = "NET01", Fee = 5000, DurationWeeks = 6 },
            new Course { Id = 2, Title = "Angular", Code = "ANG01", Fee = 4500, DurationWeeks = 5 }
        );

        modelBuilder.Entity<Enrollment>().HasData(
            new Enrollment
            {
                Id = 1,
                StudentId = 1,
                CourseId = 1,
                InstructorId = 1,
                Status = "Active",
                CompletionPercent = 30,
                EnrolledOn = new DateTime(2024, 1, 1)
            }
        );

        modelBuilder.Entity<Assignment>().HasData(
            new Assignment { Id = 1, CourseId = 1, Title = "Mini Project", MaxScore = 100 }
        );

        modelBuilder.Entity<Result>().HasData(
            new Result { Id = 1, AssignmentId = 1, StudentId = 1, Score = 85 }
        );
    }
}