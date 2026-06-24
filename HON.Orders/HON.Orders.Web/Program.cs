using HON.Orders.Data;
using HON.Orders.Domain.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sql => sql.MigrationsAssembly("HON.Orders.Data")));

builder.Services.AddScoped<OrderService>();

builder.Services.AddControllersWithViews();
builder.Services.AddAuthorization();

// TODO: Register MVC filters, areas, and any custom services needed for HON Orders.
var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
  var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
  db.Database.Migrate();
}

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
  name: "admin",
  pattern: "admin/{controller=product}/{action=index}/{id?}",
  defaults: new { area = "Admin" });

app.MapControllerRoute(
  name: "default",
  pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
