using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace InventarioSOAP_A.Models
{
    public class Producto
    {
        [Key]
        public int IdProducto { get; set; }

        [Required]
        [MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Descripcion { get; set; }

        public decimal Precio { get; set; }

        public int Stock { get; set; }

        public bool Estado { get; set; }

        public int IdCategoria { get; set; }

        [IgnoreDataMember]
        public Categoria? Categoria { get; set; }

        [IgnoreDataMember]
        public ICollection<MovimientoInventario> Movimientos { get; set; } =
            new List<MovimientoInventario>();
    }
}
