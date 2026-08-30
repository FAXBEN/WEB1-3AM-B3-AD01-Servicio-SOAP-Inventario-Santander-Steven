using CoreWCF;
using InventarioSOAP_A.Data;
using InventarioSOAP_A.Models;
using Microsoft.EntityFrameworkCore;

namespace InventarioSOAP_A.Services
{
    [ServiceBehavior(InstanceContextMode = InstanceContextMode.PerCall)]
    public class CatalogoService : ICatalogoService
    {
        private readonly InventarioDBContext _context;

        public CatalogoService(InventarioDBContext context)
        {
            _context = context;
        }

        public List<Categoria> ObtenerCategorias()
        {
            return _context.Categorias
                .AsNoTracking()
                .OrderBy(c => c.IdCategoria)
                .ToList();
        }

        public List<Producto> ObtenerProductos()
        {
            return _context.Productos
                .AsNoTracking()
                .OrderBy(p => p.IdProducto)
                .ToList();
        }

        public Producto? ObtenerProducto(int id)
        {
            return _context.Productos
                .AsNoTracking()
                .FirstOrDefault(p => p.IdProducto == id);
        }

        public Producto AgregarProducto(Producto producto)
        {
            ValidarCategoria(producto.IdCategoria);

            producto.IdProducto = 0;
            producto.Categoria = null;

            _context.Productos.Add(producto);
            _context.SaveChanges();
            return producto;
        }

        public Producto? ActualizarProducto(Producto producto)
        {
            var productoExistente = _context.Productos.Find(producto.IdProducto);

            if (productoExistente == null) return null;

            ValidarCategoria(producto.IdCategoria);

            productoExistente.Nombre = producto.Nombre;
            productoExistente.Descripcion = producto.Descripcion;
            productoExistente.Precio = producto.Precio;
            productoExistente.Stock = producto.Stock;
            productoExistente.Estado = producto.Estado;
            productoExistente.IdCategoria = producto.IdCategoria;

            _context.SaveChanges();
            return productoExistente;
        }

        public bool EliminarProducto(int id)
        {
            var producto = _context.Productos.Find(id);

            if (producto == null) return false;

            _context.Productos.Remove(producto);
            _context.SaveChanges();
            return true;
        }

        public List<Producto> ObtenerProductosPorPrecio(
            decimal precioMinimo,
            decimal precioMaximo
        )
        {
            return _context.Productos
                .AsNoTracking()
                .Where(p => p.Precio >= precioMinimo && p.Precio <= precioMaximo)
                .OrderBy(p => p.Precio)
                .ThenBy(p => p.IdProducto)
                .ToList();
        }

        public List<Producto> ObtenerProductosPorCategoria(int idCategoria)
        {
            return _context.Productos
                .AsNoTracking()
                .Where(p => p.IdCategoria == idCategoria)
                .OrderBy(p => p.IdProducto)
                .ToList();
        }

        private void ValidarCategoria(int idCategoria)
        {
            if (!_context.Categorias.Any(c => c.IdCategoria == idCategoria))
            {
                throw new FaultException("La categoría indicada no existe.");
            }
        }
    }
}
