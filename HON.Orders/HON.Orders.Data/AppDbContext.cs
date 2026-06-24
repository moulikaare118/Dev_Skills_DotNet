namespace HON.Orders.Data
{
  public class AppDbContext : DbContext
  {
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options)
      : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);

      // TODO: Configure Fluent API for decimal precision, rowversion concurrency,
      // relationships, soft delete filters, and shadow audit properties.

      modelBuilder.Entity<Customer>()
        .HasIndex(c => c.Email)
        .IsUnique();

      modelBuilder.Entity<Product>()
        .Property(p => p.UnitPrice)
        .HasPrecision(18, 2);

      modelBuilder.Entity<Product>()
        .Property(p => p.RowVersion)
        .IsRowVersion();

      modelBuilder.Entity<Order>()
        .HasIndex(o => o.OrderNumber)
        .IsUnique();

      modelBuilder.Entity<Order>()
        .Property(o => o.Total)
        .HasPrecision(18, 2);

      modelBuilder.Entity<Order>()
        .Property(o => o.RowVersion)
        .IsRowVersion();

      modelBuilder.Entity<Order>()
        .HasOne(o => o.Customer)
        .WithMany(c => c.Orders)
        .HasForeignKey(o => o.CustomerId)
        .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<OrderItem>()
        .HasOne(oi => oi.Order)
        .WithMany(o => o.OrderItems)
        .HasForeignKey(oi => oi.OrderId)
        .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<OrderItem>()
        .HasOne(oi => oi.Product)
        .WithMany(p => p.OrderItems)
        .HasForeignKey(oi => oi.ProductId);

      modelBuilder.Entity<Payment>()
        .HasOne(p => p.Order)
        .WithMany(o => o.Payments)
        .HasForeignKey(p => p.OrderId)
        .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<Customer>().HasQueryFilter(c => !c.IsDeleted);
      modelBuilder.Entity<Product>().HasQueryFilter(p => !p.IsDeleted);
      modelBuilder.Entity<Order>().HasQueryFilter(o => !o.IsDeleted);
      modelBuilder.Entity<OrderItem>().HasQueryFilter(oi => !oi.IsDeleted);
      modelBuilder.Entity<Payment>().HasQueryFilter(p => !p.IsDeleted);

      // TODO: Use a global soft delete query filter and expose IncludeDeleted<T>()
      // for admin screens that must show deleted records.

      foreach (var entity in modelBuilder.Model.GetEntityTypes())
      {
        modelBuilder.Entity(entity.ClrType)
          .Property<DateTime>("CreatedAt")
          .HasDefaultValueSql("GETUTCDATE()");

        modelBuilder.Entity(entity.ClrType)
          .Property<DateTime>("LastModifiedAt")
          .HasDefaultValueSql("GETUTCDATE()");
      }
    }
  }

  public interface IHasSoftDelete
  {
    bool IsDeleted { get; set; }
  }
}