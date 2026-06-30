using DataAccess.Repository;
using HONOrdersApp.Filters;
using Microsoft.EntityFrameworkCore;
using DataAccess.Data;   

namespace HONOrdersApp
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllersWithViews();
            builder.Services.AddControllersWithViews(options =>
            {
                options.Filters.Add<ExecutionTimeFilter>();
            });
        
            builder.Services.AddDbContext<HONOrdersDbContex>(options =>
                options.UseSqlite("Data Source=HONOrders.db"));

            builder.Services.AddScoped<IOrderRepository, OrderRepository>();
            builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
            }
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");

            app.Run();
        }
    }
}
