import { Component, Input, Injector, afterNextRender, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { timeout } from 'rxjs';
import { SERVICIOS } from '../config/servicios';
import { Producto } from '../Model/producto.model';
import { Categoria } from '../Model/categoria.model';
import { mensajeError } from '../services/errores';

interface ProductoExterno { id: number; title: string; description: string; category: string; price: number; thumbnail: string; }

@Component({
  selector: 'app-catalogo-externo',
  imports: [FormsModule, DecimalPipe],
  template: `
    <section class="integration-section" id="catalogo-externo">
      <div class="section-heading"><div><span class="eyebrow">03 / API pública · DummyJSON</span><h2>Explorar y comparar</h2><p>Un catálogo externo para consultar referencias de productos.</p></div><span class="category-pill">Consulta en vivo</span></div>
      <p class="service-note">Datos de demostración de DummyJSON, no cotizaciones comerciales. La consulta sale directamente de Angular; no crea registros en tu base de datos. Precios de referencia sin conversión de moneda.</p>
      <form class="integration-toolbar" (ngSubmit)="consultar()"><label>Buscar en el catálogo público<input name="externoBusqueda" [(ngModel)]="busqueda" maxlength="100" placeholder="Ej. apple, coffee, milk (nombres en inglés)"></label><button class="button button-primary" [disabled]="cargando()">{{ cargando() ? 'Consultando…' : 'Consultar API' }}</button><button type="button" class="button button-ghost" (click)="alimentos()" [disabled]="cargando()">Ver alimentos</button></form>
      @if (error()) { <p class="feedback feedback-error" role="alert">{{ error() }} Puedes volver a consultar.</p> }
      @if (!consultado() && !cargando()) { <p class="feedback">Pulsa «Ver alimentos» o busca un producto para realizar la consulta pública.</p> }
      @if (consultado() && !cargando() && !error() && !resultados().length) { <p class="feedback" role="status">Sin resultados. Prueba otro nombre, por ejemplo apple.</p> }
      @if (resultados().length) { <p role="status">{{ resultados().length }} referencias recibidas. Selecciona una para compararla con un producto local.</p> }
      <div class="external-grid">@for (p of resultados(); track p.id) {
        <article class="external-card"><img [src]="p.thumbnail" [alt]="p.title" loading="lazy" referrerpolicy="no-referrer"><div><span class="eyebrow">{{ p.category }}</span><h3>{{ p.title }}</h3><p>{{ p.description }}</p><strong>Precio API: {{ p.price | number:'1.2-2' }}</strong><button class="button button-ghost" (click)="comparar(p)">Comparar con mi inventario</button></div></article>
      }</div>
      @if (seleccionado(); as referencia) {
        <div class="comparison-panel"><h3>Comparación de referencia</h3><label>Producto local<select name="compararProducto" [(ngModel)]="idLocal"><option [ngValue]="0">Selecciona un producto</option>@for (p of productos; track p.idProducto) { <option [ngValue]="p.idProducto">{{ p.nombre }}</option> }</select></label>
          <div class="comparison-columns"><div><span class="eyebrow">Catálogo externo</span><h3>{{ referencia.title }}</h3><p>Categoría: {{ referencia.category }}</p><p>Precio API: {{ referencia.price | number:'1.2-2' }} (sin moneda especificada)</p></div><div><span class="eyebrow">Mi inventario · SQL Server</span>@if (local(); as p) { <h3>{{ p.nombre }}</h3><p>Categoría: {{ categoria(p.idCategoria) }}</p><p>Precio local: {{ p.precio | number:'1.2-2' }} · Stock: {{ p.stock }}</p> } @else { <p>Selecciona un producto local para comparar sus datos.</p> }</div></div><p>La asociación es manual: no se supone que ambos artículos sean equivalentes ni que sus monedas coincidan.</p>
        </div>
      }
      <a href="https://dummyjson.com/docs/products" target="_blank" rel="noopener noreferrer">Documentación de la API pública ↗</a>
    </section>
  `
})
export class CatalogoExternoComponent {
  @Input() productos: Producto[] = [];
  @Input() categorias: Categoria[] = [];
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector);
  resultados = signal<ProductoExterno[]>([]);
  seleccionado = signal<ProductoExterno | null>(null);
  cargando = signal(false);
  consultado = signal(false);
  error = signal('');
  busqueda = '';
  idLocal = 0;
  comparar(producto: ProductoExterno) {
    this.seleccionado.set(producto);
    afterNextRender(() => document.querySelector('.comparison-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), { injector: this.injector });
  }
  local() { return this.productos.find(p => p.idProducto === this.idLocal); }
  categoria(id: number) { return this.categorias.find(c => c.idCategoria === id)?.nombre ?? `#${id}`; }
  alimentos() { this.busqueda = ''; this.consultar(true); }
  consultar(alimentos = false) {
    if (this.cargando()) return;
    this.cargando.set(true); this.error.set(''); this.resultados.set([]); this.seleccionado.set(null);
    const url = alimentos || !this.busqueda.trim()
      ? `${SERVICIOS.catalogoExterno}/category/groceries?limit=12`
      : `${SERVICIOS.catalogoExterno}/search?q=${encodeURIComponent(this.busqueda.trim())}&limit=12`;
    this.http.get<{ products: ProductoExterno[] }>(url).pipe(timeout(15000)).subscribe({
      next: datos => { this.resultados.set(datos.products ?? []); this.cargando.set(false); this.consultado.set(true); },
      error: e => { this.error.set(mensajeError(e)); this.cargando.set(false); this.consultado.set(true); }
    });
  }
}
