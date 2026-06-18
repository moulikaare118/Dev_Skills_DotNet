using HON.Orders.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HON.Orders.Data;

// task2.1 / task2.2 - Configure EF Core model, relationships, precision, concurrency, shadow props, and soft delete filters
public class HonOrdersDbContext : DbContext
{
    public HonOrdersDbContext(DbContextOptions<HonOrdersDbContext> options)
        : base(options)
    {
    }

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Customer>(builder =>
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Email).IsRequired().HasMaxLength(200);
            builder.HasMany(x => x.Orders).WithOne(x => x.Customer).HasForeignKey(x => x.CustomerId);
        });

        modelBuilder.Entity<Product>(builder =>
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Sku).IsRequired().HasMaxLength(50);
            builder.Property(x => x.UnitPrice).HasPrecision(18, 2);
            builder.Property(x => x.Category).HasMaxLength(100);
            builder.Property(x => x.RowVersion).IsRowVersion();
            builder.Property<bool>("IsDeleted").HasDefaultValue(false);
            builder.Property<string>("CreatedBy").HasMaxLength(100);
            builder.Property<DateTime>("LastModified");
            builder.HasQueryFilter(x => !x.IsDeleted);
        });

        modelBuilder.Entity<Order>(builder =>
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.OrderNumber).IsRequired().HasMaxLength(50);
            builder.Property(x => x.Total).HasPrecision(18, 2);
            builder.Property(x => x.RowVersion).IsRowVersion();
            builder.Property<bool>("IsDeleted").HasDefaultValue(false);
            builder.Property<string>("CreatedBy").HasMaxLength(100);
            builder.Property<DateTime>("LastModified");
            builder.HasQueryFilter(x => !x.IsDeleted);
            builder.HasMany(x => x.OrderItems).WithOne(x => x.Order).HasForeignKey(x => x.OrderId);
            builder.HasOne(x => x.Payment).WithOne(x => x.Order!).HasForeignKey<Payment>(x => x.OrderId);
        });

        modelBuilder.Entity<OrderItem>(builder =>
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.UnitPrice).HasPrecision(18, 2);
            builder.Property(x => x.LineTotal).HasPrecision(18, 2);
            builder.HasOne(x => x.Product).WithMany(x => x.OrderItems).HasForeignKey(x => x.ProductId);
        });

        modelBuilder.Entity<Payment>(builder =>
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Amount).HasPrecision(18, 2);
            builder.Property(x => x.Method).IsRequired().HasMaxLength(100);
        });

        modelBuilder.Entity<AuditLog>(builder =>
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.EntityName).IsRequired().HasMaxLength(100);
            builder.Property(x => x.EntityId).IsRequired().HasMaxLength(100);
            builder.Property(x => x.Action).IsRequired().HasMaxLength(100);
            builder.Property(x => x.Username).IsRequired().HasMaxLength(100);
            builder.Property(x => x.OccurredAt).IsRequired();
            builder.Property(x => x.Details).IsRequired();
        });
    }
}
