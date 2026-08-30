using CoreWCF;
using InventarioSOAP_A.Models;

namespace InventarioSOAP_A.Services
{
    [ServiceContract]
    public interface ICatalogoService
    {
        [OperationContract]
        List<Categoria> ObtenerCategorias();

        [OperationContract]
        List<Producto> ObtenerProductos();

        [OperationContract]
        Producto? ObtenerProducto(int id);

        [OperationContract]
        Producto AgregarProducto(Producto producto);

        [OperationContract]
        Producto? ActualizarProducto(Producto producto);

        [OperationContract]
        bool EliminarProducto(int id);

        [OperationContract]
        List<Producto> ObtenerProductosPorPrecio(
            decimal precioMinimo,
            decimal precioMaximo
        );

        [OperationContract]
        List<Producto> ObtenerProductosPorCategoria(int idCategoria);
    }
}
