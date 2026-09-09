import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { Categoria } from './Model/categoria.model';
import { Producto } from './Model/producto.model';
import { CatalogoSoapService } from './services/catalogo';
import { CategoriasComponent } from './features/categorias';
import { MovimientosComponent } from './features/movimientos';
import { CatalogoExternoComponent } from './features/catalogo-externo';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, CategoriasComponent, MovimientosComponent, CatalogoExternoComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  categorias: Categoria[] = [];
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  cargando = true;
  cargandoProductos = false;
  guardando = false;
  servicioDisponible = false;
  mostrarFormulario = false;
  modoEdicion = false;

  textoBusqueda = '';
  idBusqueda: number | null = null;
  categoriaSeleccionada = 0;
  precioMinimo: number | null = null;
  precioMaximo: number | null = null;
  descripcionFiltro = 'Todos los productos';

  mensajeToast = '';
  tipoToast: 'exito' | 'error' = 'exito';
  productoFormulario: Producto = this.productoVacio();

  readonly fechaActual = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long'
  }).format(new Date());

  private temporizadorToast?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly catalogoService: CatalogoSoapService,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  get productosVisibles(): Producto[] {
    const termino = this.textoBusqueda.trim().toLocaleLowerCase('es');
    if (!termino) return this.productosFiltrados;
    return this.productosFiltrados.filter((producto) =>
      producto.nombre.toLocaleLowerCase('es').includes(termino) ||
      producto.descripcion.toLocaleLowerCase('es').includes(termino) ||
      this.nombreCategoria(producto.idCategoria).toLocaleLowerCase('es').includes(termino)
    );
  }

  get stockTotal(): number {
    return this.productos.reduce((total, producto) => total + producto.stock, 0);
  }

  get valorInventario(): number {
    return this.productos.reduce((total, producto) => total + producto.precio * producto.stock, 0);
  }

  get productosStockBajo(): number {
    return this.productos.filter((producto) => producto.stock <= 10).length;
  }

  cargarDatos(mensaje?: string): void {
    this.cargando = true;
    forkJoin({
      categorias: this.catalogoService.obtenerCategorias(),
      productos: this.catalogoService.obtenerProductos()
    }).subscribe({
      next: ({ categorias, productos }) => {
        this.categorias = categorias;
        this.productos = productos;
        this.productosFiltrados = productos;
        this.idBusqueda = null;
        this.categoriaSeleccionada = 0;
        this.precioMinimo = null;
        this.precioMaximo = null;
        this.textoBusqueda = '';
        this.descripcionFiltro = 'Todos los productos';
        this.servicioDisponible = true;
        this.cargando = false;
        if (mensaje) this.mostrarToast(mensaje, 'exito');
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.cargando = false;
        this.servicioDisponible = false;
        this.mostrarToast(this.mensajeError(error), 'error');
        this.changeDetector.markForCheck();
      }
    });
  }

  filtrarPorCategoria(): void {
    if (this.categoriaSeleccionada === 0) {
      this.limpiarFiltros();
      return;
    }
    this.idBusqueda = null;
    this.precioMinimo = null;
    this.precioMaximo = null;
    const categoria = this.categorias.find((item) => item.idCategoria === this.categoriaSeleccionada);
    this.ejecutarFiltro(
      this.catalogoService.obtenerProductosPorCategoria(this.categoriaSeleccionada),
      categoria?.nombre ?? 'Categoría seleccionada'
    );
  }

  seleccionarCategoria(idCategoria: number): void {
    this.categoriaSeleccionada = idCategoria;
    this.filtrarPorCategoria();
    document.querySelector('#productos')?.scrollIntoView({ behavior: 'smooth' });
  }

  filtrarPorPrecio(): void {
    if (this.precioMinimo === null || this.precioMaximo === null) {
      this.mostrarToast('Ingresa el precio mínimo y máximo.', 'error');
      return;
    }
    if (this.precioMinimo < 0 || this.precioMaximo < this.precioMinimo) {
      this.mostrarToast('El rango de precios no es válido.', 'error');
      return;
    }
    this.idBusqueda = null;
    this.categoriaSeleccionada = 0;
    this.ejecutarFiltro(
      this.catalogoService.obtenerProductosPorPrecio(this.precioMinimo, this.precioMaximo),
      `Precios entre ${this.formatoMoneda(this.precioMinimo)} y ${this.formatoMoneda(this.precioMaximo)}`
    );
  }

  buscarPorId(): void {
    if (!this.idBusqueda || this.idBusqueda < 1) {
      this.mostrarToast('Ingresa un identificador válido.', 'error');
      return;
    }
    this.categoriaSeleccionada = 0;
    this.precioMinimo = null;
    this.precioMaximo = null;
    this.cargandoProductos = true;
    this.catalogoService.obtenerProducto(this.idBusqueda).subscribe({
      next: (producto) => {
        this.productosFiltrados = producto ? [producto] : [];
        this.descripcionFiltro = `Resultado para el ID ${this.idBusqueda}`;
        this.cargandoProductos = false;
        if (!producto) this.mostrarToast('No se encontró ese producto.', 'error');
        this.changeDetector.markForCheck();
      },
      error: (error) => this.errorFiltro(error)
    });
  }

  limpiarFiltros(): void {
    this.idBusqueda = null;
    this.categoriaSeleccionada = 0;
    this.precioMinimo = null;
    this.precioMaximo = null;
    this.textoBusqueda = '';
    this.productosFiltrados = this.productos;
    this.descripcionFiltro = 'Todos los productos';
  }

  abrirNuevoProducto(): void {
    this.modoEdicion = false;
    this.productoFormulario = this.productoVacio();
    this.mostrarFormulario = true;
  }

  abrirEdicion(producto: Producto): void {
    this.modoEdicion = true;
    this.productoFormulario = { ...producto };
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    if (!this.guardando) this.mostrarFormulario = false;
  }

  guardarProducto(): void {
    if (this.guardando) return;
    if (!this.formularioValido()) {
      this.mostrarToast('Completa correctamente los campos obligatorios.', 'error');
      return;
    }
    this.guardando = true;
    const peticion = this.modoEdicion
      ? this.catalogoService.actualizarProducto(this.productoFormulario)
      : this.catalogoService.agregarProducto(this.productoFormulario);
    peticion.subscribe({
      next: (producto) => {
        this.guardando = false;
        if (!producto) {
          this.mostrarToast('El producto ya no existe.', 'error');
          return;
        }
        this.mostrarFormulario = false;
        this.limpiarFiltros();
        this.cargarDatos(this.modoEdicion ? 'Producto actualizado.' : 'Producto agregado.');
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.guardando = false;
        this.mostrarToast(this.mensajeError(error), 'error');
        this.changeDetector.markForCheck();
      }
    });
  }

  eliminarProducto(producto: Producto): void {
    if (!window.confirm(`¿Deseas eliminar “${producto.nombre}”? Esta acción no se puede deshacer.`)) return;
    this.catalogoService.eliminarProducto(producto.idProducto).subscribe({
      next: (eliminado) => {
        if (eliminado) {
          this.limpiarFiltros();
          this.cargarDatos('Producto eliminado.');
        } else {
          this.mostrarToast('El producto ya no existe.', 'error');
        }
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.mostrarToast(this.mensajeError(error), 'error');
        this.changeDetector.markForCheck();
      }
    });
  }

  nombreCategoria(idCategoria: number): string {
    return this.categorias.find((categoria) => categoria.idCategoria === idCategoria)?.nombre ?? 'Sin categoría';
  }

  cantidadPorCategoria(idCategoria: number): number {
    return this.productos.filter((producto) => producto.idCategoria === idCategoria).length;
  }

  claseStock(stock: number): string {
    if (stock <= 10) return 'stock-bajo';
    if (stock <= 20) return 'stock-medio';
    return 'stock-alto';
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(valor);
  }

  private ejecutarFiltro(peticion: Observable<Producto[]>, descripcion: string): void {
    this.cargandoProductos = true;
    peticion.subscribe({
      next: (productos) => {
        this.productosFiltrados = productos;
        this.descripcionFiltro = descripcion;
        this.cargandoProductos = false;
        this.changeDetector.markForCheck();
      },
      error: (error) => this.errorFiltro(error)
    });
  }

  private errorFiltro(error: unknown): void {
    this.cargandoProductos = false;
    this.mostrarToast(this.mensajeError(error), 'error');
    this.changeDetector.markForCheck();
  }

  private formularioValido(): boolean {
    return this.productoFormulario.nombre.trim().length > 0 &&
      this.productoFormulario.nombre.length <= 150 && this.productoFormulario.descripcion.length <= 500 &&
      this.productoFormulario.idCategoria > 0 &&
      Number.isFinite(this.productoFormulario.precio) && Number.isInteger(this.productoFormulario.stock) &&
      this.productoFormulario.precio >= 0 &&
      this.productoFormulario.stock >= 0;
  }

  private productoVacio(): Producto {
    return { idProducto: 0, nombre: '', descripcion: '', precio: 0, stock: 0, estado: true, idCategoria: 0 };
  }

  private mostrarToast(mensaje: string, tipo: 'exito' | 'error'): void {
    this.mensajeToast = mensaje;
    this.tipoToast = tipo;
    if (this.temporizadorToast) clearTimeout(this.temporizadorToast);
    this.temporizadorToast = setTimeout(() => {
      this.mensajeToast = '';
      this.changeDetector.markForCheck();
    }, 4200);
    this.changeDetector.markForCheck();
  }

  private mensajeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return 'No se pudo conectar con el servicio SOAP en el puerto 5163.';
      const respuesta = typeof error.error === 'string' ? error.error : '';
      const documento = respuesta ? new DOMParser().parseFromString(respuesta, 'text/xml') : null;
      const detalle = documento?.getElementsByTagNameNS('*', 'faultstring')[0]?.textContent;
      return detalle?.trim() || `El servicio respondió con el error HTTP ${error.status}.`;
    }
    return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
  }
}
