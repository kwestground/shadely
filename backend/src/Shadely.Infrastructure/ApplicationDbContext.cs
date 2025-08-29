using Microsoft.EntityFrameworkCore;
using Shadely.Core;

namespace Shadely.Infrastructure;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Area> Areas => Set<Area>();
    public DbSet<AreaPosition> AreaPositions => Set<AreaPosition>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply global soft delete filter
        modelBuilder.Entity<Customer>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Project>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Area>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<AreaPosition>().HasQueryFilter(e => !e.IsDeleted);

        // Concurrency
        modelBuilder.Entity<Customer>().Property(e => e.RowVersion).IsRowVersion();
        modelBuilder.Entity<Project>().Property(e => e.RowVersion).IsRowVersion();
        modelBuilder.Entity<Area>().Property(e => e.RowVersion).IsRowVersion();
        modelBuilder.Entity<AreaPosition>().Property(e => e.RowVersion).IsRowVersion();

        // Enum as string
        modelBuilder.Entity<Project>().Property(p => p.Status).HasConversion<string>().HasMaxLength(40);
        modelBuilder.Entity<AreaPosition>().Property(p => p.Status).HasConversion<string>().HasMaxLength(40);

        // Relationships & constraints
        modelBuilder.Entity<Project>()
            .HasOne(p => p.Customer)
            .WithMany(c => c.Projects)
            .HasForeignKey(p => p.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Area>()
            .HasOne(a => a.Project)
            .WithMany(p => p.Areas)
            .HasForeignKey(a => a.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AreaPosition>()
            .HasOne(p => p.Area)
            .WithMany(a => a.Positions)
            .HasForeignKey(p => p.AreaId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
