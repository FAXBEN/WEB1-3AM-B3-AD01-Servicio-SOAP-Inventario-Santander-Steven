import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CatalogoExternoComponent } from './catalogo-externo';
import { MovimientosComponent } from './movimientos';
import { CatalogoSoapService } from '../services/catalogo';
import { SERVICIOS } from '../config/servicios';

describe('Integración SOAP, REST y API externa', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('escapa los caracteres especiales de una categoría y envía SOAPAction', () => {
    TestBed.inject(CatalogoSoapService).guardarCategoria({ idCategoria: 0, nombre: 'Café & <té>', descripcion: '', estado: true }, false).subscribe(ok => expect(ok).toBe(true));
    const peticion = http.expectOne(SERVICIOS.soap);
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.headers.get('SOAPAction')).toContain('/AgregarCategoria');
    expect(peticion.request.body).toContain('Café &amp; &lt;té&gt;');
    peticion.flush('<Envelope><AgregarCategoriaResult><IdCategoria>9</IdCategoria></AgregarCategoriaResult></Envelope>');
  });

  it('lee categorías con prefijos XML diferentes', () => {
    TestBed.inject(CatalogoSoapService).obtenerCategorias().subscribe(datos => expect(datos[0].nombre).toBe('Frutas'));
    http.expectOne(SERVICIOS.soap).flush('<s:Envelope xmlns:s="soap" xmlns:x="datos"><x:Categoria><x:IdCategoria>1</x:IdCategoria><x:Nombre>Frutas</x:Nombre><x:Estado>true</x:Estado></x:Categoria></s:Envelope>');
  });

  it('muestra resultados reales recibidos del endpoint público', () => {
    const fixture = TestBed.createComponent(CatalogoExternoComponent);
    fixture.componentInstance.alimentos();
    http.expectOne(`${SERVICIOS.catalogoExterno}/category/groceries?limit=12`).flush({ products: [{ id: 1, title: 'Apple', description: 'Fruit', category: 'groceries', price: 2, thumbnail: '' }] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Apple');
    expect(fixture.componentInstance.cargando()).toBe(false);
  });

  it('distingue una consulta sin resultados', () => {
    const fixture = TestBed.createComponent(CatalogoExternoComponent);
    fixture.componentInstance.busqueda = 'sin coincidencias';
    fixture.componentInstance.consultar();
    http.expectOne(`${SERVICIOS.catalogoExterno}/search?q=sin%20coincidencias&limit=12`).flush({ products: [] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sin resultados');
  });

  it('muestra el fallo externo sin inventar productos', () => {
    const fixture = TestBed.createComponent(CatalogoExternoComponent);
    fixture.componentInstance.alimentos();
    http.expectOne(`${SERVICIOS.catalogoExterno}/category/groceries?limit=12`).flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('HTTP 503');
    expect(fixture.componentInstance.resultados()).toEqual([]);
  });

  it('bloquea cantidades fraccionarias antes de enviar REST', () => {
    const fixture = TestBed.createComponent(MovimientosComponent);
    const c = fixture.componentInstance;
    c.productos = [{ idProducto: 1, idCategoria: 1, nombre: 'Café', descripcion: '', precio: 5, stock: 2, estado: true }];
    c.modelo.idProducto = 1; c.modelo.cantidad = 1.5; c.guardar();
    expect(c.error()).toBe(true);
    http.expectNone(SERVICIOS.movimientos);
  });

  it('guarda movimiento con POST y vuelve a consultar la persistencia', () => {
    const fixture = TestBed.createComponent(MovimientosComponent);
    const c = fixture.componentInstance;
    c.productos = [{ idProducto: 1, idCategoria: 1, nombre: 'Café', descripcion: '', precio: 5, stock: 2, estado: true }];
    c.modelo.idProducto = 1; c.guardar();
    const peticion = http.expectOne(SERVICIOS.movimientos);
    expect(peticion.request.method).toBe('POST');
    peticion.flush({ ...c.modelo, idMovimiento: 7 });
    http.expectOne(SERVICIOS.movimientos).flush([{ ...c.modelo, idMovimiento: 7 }]);
    expect(c.movimientos()[0].idMovimiento).toBe(7);
    expect(c.mensaje()).toContain('SQL Server');
  });
});
