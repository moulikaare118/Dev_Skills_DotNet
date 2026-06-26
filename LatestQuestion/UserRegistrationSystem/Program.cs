using DataAccess.Data;
using EventManagment.DAL.Repository;
using Microsoft.EntityFrameworkCore;

namespace UserRegistrationSystem
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // TO DO List:
            // Important and Mandatory:
            // - Register all essential services here (e.g.database connection string, repositories via dependency injection).
            // - Finally, define the default route so the application starts with UserDetail/Index action.

            // Add services to the container.
            builder.Services.AddControllersWithViews();
            builder.Services.AddDbContext<UserDetailDbContext>(options =>
                options.UseSqlite("Data Source=UserDetails.db"));
            builder.Services.AddScoped<IRepository, Repository>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
            }
            app.UseRouting();

            app.UseAuthorization();

            //app.MapStaticAssets();
            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=UserDetail}/{action=Index}/{id?}");
               // .WithStaticAssets();

            app.Run();
        }
    }
}
