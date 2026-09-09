import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Producto } from '../Model/producto.model';
import { MovimientoInventario } from '../Model/movimiento.model';
import { MovimientosService } from '../services/movimientos';
import { mensajeError } from '../services/errores';

@Component({
  selector: 'app-movimientos',
  imports: [FormsModule, DatePipe],
  template: `
    <section class="integration-section" id="movimientos">
      <div class="section-heading"><div><span class="eyebrow">02 / Servicio REST</span><h2>Movimientos de inventario</h2><p>Entradas y salidas relacionadas con tus productos.</p></div><button class="button button-primary" (click)="abrir()" [disabled]="ocupado() || !productos.length">Nuevo movimiento</button></div>
      <p class="service-note">Este módulo registra movimientos. No modifica automáticamente el campo Stock del producto; se conserva la lógica del servicio REST de la tarea anterior.</p>
      <form class="integration-toolbar" (ngSubmit)="buscar()"><label>Consultar por ID <input name="movBusqueda" type="number" min="1" step="1" [(ngModel)]="idBusqueda" placeholder="Ej. 1"></label><button class="button button-ghost" [disabled]="ocupado()">Buscar</button><button type="button" class="button button-ghost" (click)="cargar()" [disabled]="ocupado()">Ver todos / Actualizar</button></form>
      @if (mensaje()) { <p class="feedback" [class.feedback-error]="error()" role="status">{{ mensaje() }}</p> }
      @if (!productos.length) { <p class="feedback">Necesitas al menos un producto cargado desde SOAP para registrar movimientos.</p> }
      @if (formulario()) {
        <form class="integration-form" #f="ngForm" (ngSubmit)="guardar()">
          <h3>{{ modelo.idMovimiento ? 'Editar movimiento #' + modelo.idMovimiento : 'Nuevo movimiento' }}</h3>
          <label>Producto *<select name="movProducto" [(ngModel)]="modelo.idProducto" required><option [ngValue]="0" disabled>Selecciona un producto</option>@for (p of productos; track p.idProducto) { <option [ngValue]="p.idProducto">#{{ p.idProducto }} — {{ p.nombre }}</option> }</select></label>
          <div class="field-columns"><label>Tipo *<select name="movTipo" [(ngModel)]="modelo.tipoMovimiento"><option>ENTRADA</option><option>SALIDA</option></select></label><label>Cantidad *<input name="movCantidad" type="number" min="1" max="2147483647" step="1" required [(ngModel)]="modelo.cantidad"></label><label>Fecha y hora *<input name="movFecha" type="datetime-local" required [(ngModel)]="modelo.fechaMovimiento"></label></div>
          <label>Observación<textarea name="movObservacion" maxlength="500" rows="2" [(ngModel)]="modelo.observacion"></textarea></label>
          <div class="inline-actions"><button class="button button-primary" [disabled]="ocupado() || f.invalid">{{ ocupado() ? 'Guardando…' : 'Guardar movimiento' }}</button><button type="button" class="button button-ghost" (click)="formulario.set(false)" [disabled]="ocupado()">Cancelar</button></div>
        </form>
      }
      @if (ocupado()) { <p class="feedback" role="status">Conectando con el servicio REST…</p> }
      <div class="table-scroll"><table class="integration-table"><thead><tr><th>ID</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Fecha</th><th>Observación</th><th>Acciones</th></tr></thead><tbody>
        @for (m of movimientos(); track m.idMovimiento) {
          <tr><td>#{{ m.idMovimiento }}</td><td><strong>{{ nombreProducto(m.idProducto) }}</strong><small>Producto #{{ m.idProducto }}</small></td><td><span class="movement-kind" [class.outgoing]="m.tipoMovimiento === 'SALIDA'">{{ m.tipoMovimiento }}</span></td><td>{{ m.cantidad }}</td><td>{{ m.fechaMovimiento | date:'dd/MM/yyyy HH:mm' }}</td><td>{{ m.observacion || '—' }}</td><td><div class="inline-actions"><button class="button button-ghost" (click)="abrir(m)" [disabled]="ocupado()">Editar</button><button class="button button-ghost danger" (click)="eliminar(m)" [disabled]="ocupado()">Eliminar</button></div></td></tr>
        } @empty { @if (!ocupado()) { <tr><td colspan="7">No hay movimientos para mostrar.</td></tr> } }
      </tbody></table></div>
    </section>
  `
})
export class MovimientosComponent implements OnInit {
  @Input() productos: Producto[] = [];
  private readonly servicio = inject(MovimientosService);
  movimientos = signal<MovimientoInventario[]>([]);
  ocupado = signal(false);
  formulario = signal(false);
  mensaje = signal('');
  error = signal(false);
  idBusqueda: number | null = null;
  modelo = this.vacio();
  ngOnInit() { this.cargar(); }
  private vacio(): MovimientoInventario {
    const fecha = new Date();
    fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
    return { idMovimiento: 0, idProducto: 0, tipoMovimiento: 'ENTRADA', cantidad: 1, fechaMovimiento: fecha.toISOString().slice(0, 16), observacion: '' };
  }
  nombreProducto(id: number) { return this.productos.find(p => p.idProducto === id)?.nombre ?? 'Producto no cargado'; }
  cargar(mensaje = '') {
    this.ocupado.set(true); this.error.set(false); this.mensaje.set(mensaje); this.idBusqueda = null;
    this.servicio.listar().subscribe({ next: datos => { this.movimientos.set(datos); this.ocupado.set(false); }, error: e => this.fallar(e) });
  }
  buscar() {
    if (this.ocupado()) return;
    if (!Number.isInteger(this.idBusqueda) || !this.idBusqueda || this.idBusqueda < 1) {
      this.error.set(true); this.mensaje.set('Escribe un ID entero mayor que cero.'); return;
    }
    this.ocupado.set(true); this.mensaje.set(''); this.error.set(false);
    this.servicio.obtener(this.idBusqueda).subscribe({ next: m => { this.movimientos.set([m]); this.ocupado.set(false); }, error: e => { this.movimientos.set([]); this.fallar(e); } });
  }
  abrir(m?: MovimientoInventario) { this.modelo = m ? { ...m, fechaMovimiento: m.fechaMovimiento.slice(0, 16) } : this.vacio(); this.formulario.set(true); this.mensaje.set(''); }
  guardar() {
    if (this.ocupado()) return;
    if (!this.productos.some(p => p.idProducto === this.modelo.idProducto) || !Number.isInteger(this.modelo.cantidad) || this.modelo.cantidad < 1 || this.modelo.cantidad > 2147483647 || !this.modelo.fechaMovimiento || !Number.isFinite(Date.parse(this.modelo.fechaMovimiento)) || (this.modelo.observacion?.length ?? 0) > 500) {
      this.error.set(true); this.mensaje.set('Selecciona un producto, una cantidad entera positiva y una fecha válida.'); return;
    }
    this.ocupado.set(true);
    const peticion: Observable<unknown> = this.modelo.idMovimiento ? this.servicio.actualizar(this.modelo) : this.servicio.guardar(this.modelo);
    peticion.subscribe({ next: () => { this.formulario.set(false); this.cargar('Movimiento guardado en SQL Server.'); }, error: e => this.fallar(e) });
  }
  eliminar(m: MovimientoInventario) {
    if (this.ocupado() || !window.confirm(`¿Eliminar el movimiento #${m.idMovimiento}? Esta acción no se puede deshacer.`)) return;
    this.ocupado.set(true);
    this.servicio.eliminar(m.idMovimiento).subscribe({ next: () => { this.formulario.set(false); this.cargar('Movimiento eliminado de SQL Server.'); }, error: e => this.fallar(e) });
  }
  private fallar(e: unknown) { this.ocupado.set(false); this.error.set(true); this.mensaje.set(mensajeError(e)); }
}
