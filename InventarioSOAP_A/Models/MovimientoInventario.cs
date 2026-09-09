using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace InventarioSOAP_A.Models
{
    public class MovimientoInventario
    {
        [Key]
        public int IdMovimiento { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Debe indicar un producto válido.")]
        public int IdProducto { get; set; }

        [Required]
        [MaxLength(20)]
        public string TipoMovimiento { get; set; } = string.Empty;

        [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor que cero.")]
        public int Cantidad { get; set; }

        public DateTime FechaMovimiento { get; set; }

        [MaxLength(500)]
        public string? Observacion { get; set; }

        [IgnoreDataMember]
        [System.Text.Json.Serialization.JsonIgnore]
        public Producto? Producto { get; set; }
    }
}
