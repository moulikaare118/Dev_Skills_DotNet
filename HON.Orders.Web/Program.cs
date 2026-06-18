using HON.Orders.Data;
using HON.Orders.Data.Extensions;
using HON.Orders.Web.Filters;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add<ExecutionTimingFilter>();
});

builder.Services.AddDbContext<HonOrdersDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("HonOrders") ?? "Server=(localdb)\\mssqllocaldb;Database=HonOrdersDb;Trusted_Connection=True;"));

builder.Services.AddScoped<ExecutionTimingFilter>();
builder.Services.AddScoped<AdminRoleFilter>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<HonOrdersDbContext>();
    context.Database.EnsureCreated();
    await context.SeedAsync();
}

// Configure the HTTP request pipeline.
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
    name: "areas",
    pattern: "{area:exists}/{controller=Home}/{action=Index}/{id?}");

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
