using InventarioSOAP_A.Models;
using Microsoft.EntityFrameworkCore;

namespace InventarioSOAP_A.Data
{
    public class InventarioDBContext : DbContext
    {
        public InventarioDBContext(DbContextOptions<InventarioDBContext> options)
            : base(options)
        {
        }

        public DbSet<Categoria> Categorias { get; set; }

        public DbSet<Producto> Productos { get; set; }

        public DbSet<MovimientoInventario> MovimientosInventario { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Categoria>(entity =>
            {
                entity.ToTable("Categorias");
                entity.HasKey(c => c.IdCategoria);
                entity.Property(c => c.IdCategoria).ValueGeneratedOnAdd();
                entity.Property(c => c.Nombre).IsRequired().HasMaxLength(150);
                entity.Property(c => c.Descripcion).HasMaxLength(500);
            });

            modelBuilder.Entity<Producto>(entity =>
            {
                entity.ToTable("Productos");
                entity.HasKey(p => p.IdProducto);
                entity.Property(p => p.IdProducto).ValueGeneratedOnAdd();
                entity.Property(p => p.Nombre).IsRequired().HasMaxLength(150);
                entity.Property(p => p.Descripcion).HasMaxLength(500);
                entity.Property(p => p.Precio).HasPrecision(18, 2);

                entity.HasOne(p => p.Categoria)
                    .WithMany(c => c.Productos)
                    .HasForeignKey(p => p.IdCategoria)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<MovimientoInventario>(entity =>
            {
                entity.ToTable("Movimiento_Inventario", table =>
                {
                    table.HasCheckConstraint(
                        "CK_MovimientoInventario_Tipo",
                        "UPPER([TipoMovimiento]) IN ('ENTRADA', 'SALIDA')");
                    table.HasCheckConstraint(
                        "CK_MovimientoInventario_Cantidad",
                        "[Cantidad] > 0");
                });

                entity.HasKey(m => m.IdMovimiento);
                entity.Property(m => m.IdMovimiento).ValueGeneratedOnAdd();
                entity.Property(m => m.TipoMovimiento)
                    .IsRequired()
                    .HasMaxLength(20);
                entity.Property(m => m.FechaMovimiento)
                    .HasColumnType("datetime2(0)")
                    .HasDefaultValueSql("SYSDATETIME()");
                entity.Property(m => m.Observacion).HasMaxLength(500);

                entity.HasIndex(m => m.IdProducto)
                    .HasDatabaseName("IX_MovimientoInventario_IdProducto");
                entity.HasIndex(m => m.FechaMovimiento)
                    .HasDatabaseName("IX_MovimientoInventario_Fecha");

                entity.HasOne(m => m.Producto)
                    .WithMany(p => p.Movimientos)
                    .HasForeignKey(m => m.IdProducto)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_MovimientoInventario_Productos");
            });
        }
    }
}
