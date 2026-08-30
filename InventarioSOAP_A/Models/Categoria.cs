using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace InventarioSOAP_A.Models
{
    public class Categoria
    {
        [Key]
        public int IdCategoria { get; set; }

        [Required]
        [MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Descripcion { get; set; }

        public bool Estado { get; set; }

        [IgnoreDataMember]
        public ICollection<Producto> Productos { get; set; } = new List<Producto>();
    }
}
