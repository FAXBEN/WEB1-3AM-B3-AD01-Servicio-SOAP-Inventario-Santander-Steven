import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Categoria } from '../Model/categoria.model';
import { CatalogoSoapService } from '../services/catalogo';
import { mensajeError } from '../services/errores';

@Component({
  selector: 'app-categorias',
  imports: [FormsModule],
  template: `
    <section class="integration-section" id="gestion-categorias">
      <div class="section-heading"><div><span class="eyebrow">01 / Servicio SOAP</span><h2>Gestionar categorías</h2><p>Organiza los productos de tu inventario.</p></div>
        <button class="button button-primary" (click)="abrir()" [disabled]="ocupado()">Nueva categoría</button></div>
      @if (mensaje()) { <p class="feedback" [class.feedback-error]="error()" role="status">{{ mensaje() }}</p> }
      @if (formulario()) {
        <form class="integration-form" #f="ngForm" (ngSubmit)="guardar()">
          <h3>{{ modelo.idCategoria ? 'Editar categoría #' + modelo.idCategoria : 'Nueva categoría' }}</h3>
          <label>Nombre *<input name="catNombre" [(ngModel)]="modelo.nombre" required maxlength="150"></label>
          <label>Descripción<textarea name="catDescripcion" [(ngModel)]="modelo.descripcion" maxlength="500" rows="2"></textarea></label>
          <label class="check-label"><input name="catEstado" type="checkbox" [(ngModel)]="modelo.estado"> Categoría activa</label>
          <div class="inline-actions"><button class="button button-primary" [disabled]="ocupado() || f.invalid">{{ ocupado() ? 'Guardando…' : 'Guardar categoría' }}</button><button type="button" class="button button-ghost" (click)="formulario.set(false)" [disabled]="ocupado()">Cancelar</button></div>
        </form>
      }
      <div class="table-scroll"><table class="integration-table"><thead><tr><th>ID</th><th>Nombre y descripción</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
        @for (c of categorias; track c.idCategoria) {
          <tr><td>#{{ c.idCategoria }}</td><td><strong>{{ c.nombre }}</strong><small>{{ c.descripcion || 'Sin descripción' }}</small></td><td>{{ c.estado ? 'Activa' : 'Inactiva' }}</td><td><div class="inline-actions"><button class="button button-ghost" (click)="abrir(c)" [disabled]="ocupado()">Editar</button><button class="button button-ghost danger" (click)="eliminar(c)" [disabled]="ocupado()">Eliminar</button></div></td></tr>
        } @empty { <tr><td colspan="4">No hay categorías disponibles. Crea una o actualiza la conexión SOAP.</td></tr> }
      </tbody></table></div>
    </section>
  `
})
export class CategoriasComponent {
  @Input() categorias: Categoria[] = [];
  @Output() cambio = new EventEmitter<void>();
  private readonly servicio = inject(CatalogoSoapService);
  formulario = signal(false);
  ocupado = signal(false);
  mensaje = signal('');
  error = signal(false);
  modelo: Categoria = this.vacio();
  private vacio(): Categoria { return { idCategoria: 0, nombre: '', descripcion: '', estado: true }; }
  abrir(c?: Categoria) { this.modelo = c ? { ...c } : this.vacio(); this.formulario.set(true); this.mensaje.set(''); }
  guardar() {
    if (this.ocupado()) return;
    if (!this.modelo.nombre.trim() || this.modelo.nombre.length > 150 || this.modelo.descripcion.length > 500) {
      this.error.set(true); this.mensaje.set('Completa el nombre y respeta los límites de longitud.'); return;
    }
    this.ocupado.set(true);
    this.servicio.guardarCategoria({ ...this.modelo, nombre: this.modelo.nombre.trim() }, this.modelo.idCategoria > 0).subscribe({
      next: ok => {
        this.ocupado.set(false); this.error.set(!ok);
        this.mensaje.set(ok ? 'Categoría guardada en SQL Server.' : 'La categoría ya no existe. Actualiza la lista.');
        if (ok) { this.formulario.set(false); this.cambio.emit(); }
      }, error: e => this.fallar(e)
    });
  }
  eliminar(c: Categoria) {
    if (this.ocupado() || !window.confirm(`¿Eliminar la categoría “${c.nombre}”? Solo se permite si no tiene productos.`)) return;
    this.ocupado.set(true);
    this.servicio.eliminarCategoria(c.idCategoria).subscribe({
      next: ok => { this.ocupado.set(false); this.error.set(!ok); this.mensaje.set(ok ? 'Categoría eliminada.' : 'La categoría ya no existe.'); this.formulario.set(false); this.cambio.emit(); },
      error: e => this.fallar(e)
    });
  }
  private fallar(e: unknown) { this.ocupado.set(false); this.error.set(true); this.mensaje.set(mensajeError(e)); }
}
