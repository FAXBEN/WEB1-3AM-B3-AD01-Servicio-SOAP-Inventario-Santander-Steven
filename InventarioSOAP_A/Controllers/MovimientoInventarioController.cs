using InventarioSOAP_A.Data;
using InventarioSOAP_A.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventarioSOAP_A.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MovimientoInventarioController : ControllerBase
    {
        private readonly InventarioDBContext _context;

        public MovimientoInventarioController(InventarioDBContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MovimientoInventario>>>
            ObtenerMovimientos()
        {
            var movimientos = await _context.MovimientosInventario
                .AsNoTracking()
                .OrderBy(m => m.IdMovimiento)
                .ToListAsync();

            return Ok(movimientos);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<MovimientoInventario>>
            ObtenerMovimiento(int id)
        {
            var movimiento = await _context.MovimientosInventario
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.IdMovimiento == id);

            if (movimiento == null)
            {
                return NotFound(new { mensaje = "No se encontró el movimiento." });
            }

            return Ok(movimiento);
        }

        [HttpPost]
        public async Task<ActionResult<MovimientoInventario>>
            GuardarMovimiento(MovimientoInventario movimiento)
        {
            var error = await ValidarMovimiento(movimiento);
            if (error != null) return error;

            movimiento.IdMovimiento = 0;
            movimiento.TipoMovimiento = NormalizarTipo(movimiento.TipoMovimiento);
            if (movimiento.FechaMovimiento == default)
            {
                movimiento.FechaMovimiento = DateTime.Now;
            }

            movimiento.Producto = null;
            _context.MovimientosInventario.Add(movimiento);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(ObtenerMovimiento),
                new { id = movimiento.IdMovimiento },
                movimiento);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> ActualizarMovimiento(
            int id,
            MovimientoInventario movimiento)
        {
            var movimientoExistente = await _context.MovimientosInventario
                .FindAsync(id);

            if (movimientoExistente == null)
            {
                return NotFound(new { mensaje = "No se encontró el movimiento." });
            }

            var error = await ValidarMovimiento(movimiento);
            if (error != null) return error;

            movimientoExistente.IdProducto = movimiento.IdProducto;
            movimientoExistente.TipoMovimiento =
                NormalizarTipo(movimiento.TipoMovimiento);
            movimientoExistente.Cantidad = movimiento.Cantidad;
            movimientoExistente.FechaMovimiento =
                movimiento.FechaMovimiento == default
                    ? movimientoExistente.FechaMovimiento
                    : movimiento.FechaMovimiento;
            movimientoExistente.Observacion = movimiento.Observacion;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> EliminarMovimiento(int id)
        {
            var movimiento = await _context.MovimientosInventario.FindAsync(id);

            if (movimiento == null)
            {
                return NotFound(new { mensaje = "No se encontró el movimiento." });
            }

            _context.MovimientosInventario.Remove(movimiento);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<ActionResult?> ValidarMovimiento(
            MovimientoInventario movimiento)
        {
            var tipo = NormalizarTipo(movimiento.TipoMovimiento);
            if (tipo != "ENTRADA" && tipo != "SALIDA")
            {
                return BadRequest(new
                {
                    mensaje = "TipoMovimiento debe ser ENTRADA o SALIDA."
                });
            }

            var productoExiste = await _context.Productos
                .AsNoTracking()
                .AnyAsync(p => p.IdProducto == movimiento.IdProducto);

            if (!productoExiste)
            {
                return BadRequest(new
                {
                    mensaje = "El producto indicado no existe."
                });
            }

            return null;
        }

        private static string NormalizarTipo(string? tipo)
        {
            return tipo?.Trim().ToUpperInvariant() ?? string.Empty;
        }
    }
}
