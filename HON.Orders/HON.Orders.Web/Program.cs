using HON.Orders.Data;
using HON.Orders.Domain.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// TODO: Add DbContext
// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseSqlServer(
//         builder.Configuration.GetConnectionString("DefaultConnection"),
//         b => b.MigrationsAssembly("HON.Orders.Data")));

// TODO: Add services
// builder.Services.AddScoped<OrderService>();

// Add MVC services
builder.Services.AddControllersWithViews();

var app = builder.Build();

// TODO: Auto-migrate on startup
// using (var scope = app.Services.CreateScope())
// {
//     var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
//     db.Database.Migrate();
// }

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// TODO: Add authorization if needed
// app.UseAuthorization();

app.MapControllerRoute(
    name: "admin",
    pattern: "admin/{controller=product}/{action=index}/{id?}",
    defaults: new { area = "Admin" });

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
