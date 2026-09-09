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
            ValidarProducto(producto);
            ValidarCategoria(producto.IdCategoria);

            producto.IdProducto = 0;
            producto.Categoria = null;

            _context.Productos.Add(producto);
            _context.SaveChanges();
            return producto;
        }

        public Producto? ActualizarProducto(Producto producto)
        {
            ValidarProducto(producto);
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

            if (_context.MovimientosInventario.Any(m => m.IdProducto == id))
                throw new FaultException("No se puede eliminar un producto con movimientos. Elimine primero sus movimientos o desactive el producto.");

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

        public Categoria AgregarCategoria(Categoria categoria)
        {
            ValidarDatosCategoria(categoria);
            categoria.IdCategoria = 0;
            categoria.Productos = new List<Producto>();
            _context.Categorias.Add(categoria);
            _context.SaveChanges();
            return categoria;
        }

        public Categoria? ActualizarCategoria(Categoria categoria)
        {
            ValidarDatosCategoria(categoria);
            var existente = _context.Categorias.Find(categoria.IdCategoria);
            if (existente == null) return null;
            existente.Nombre = categoria.Nombre;
            existente.Descripcion = categoria.Descripcion;
            existente.Estado = categoria.Estado;
            _context.SaveChanges();
            return existente;
        }

        public bool EliminarCategoria(int id)
        {
            var categoria = _context.Categorias.Find(id);
            if (categoria == null) return false;
            if (_context.Productos.Any(p => p.IdCategoria == id))
                throw new FaultException("No se puede eliminar una categoría que tiene productos. Reasigne sus productos o desactive la categoría.");
            _context.Categorias.Remove(categoria);
            _context.SaveChanges();
            return true;
        }

        private static void ValidarDatosCategoria(Categoria categoria)
        {
            if (categoria == null || string.IsNullOrWhiteSpace(categoria.Nombre) || categoria.Nombre.Length > 150)
                throw new FaultException("El nombre de la categoría es obligatorio y admite hasta 150 caracteres.");
            if (categoria.Descripcion?.Length > 500)
                throw new FaultException("La descripción admite hasta 500 caracteres.");
            categoria.Nombre = categoria.Nombre.Trim();
        }

        private static void ValidarProducto(Producto producto)
        {
            if (producto == null || string.IsNullOrWhiteSpace(producto.Nombre) || producto.Nombre.Length > 150)
                throw new FaultException("El nombre del producto es obligatorio y admite hasta 150 caracteres.");
            if (producto.Descripcion?.Length > 500 || producto.Precio < 0 || producto.Stock < 0)
                throw new FaultException("Revise la descripción (máximo 500 caracteres), el precio y el stock (no negativos).");
            producto.Nombre = producto.Nombre.Trim();
        }
    }
}
