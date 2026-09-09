import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, timeout } from 'rxjs';
import { SERVICIOS } from '../config/servicios';
import { Categoria } from '../Model/categoria.model';
import { Producto } from '../Model/producto.model';

@Injectable({ providedIn: 'root' })
export class CatalogoSoapService {
  private readonly url = SERVICIOS.soap;

  constructor(private readonly http: HttpClient) {}

  obtenerCategorias(): Observable<Categoria[]> {
    return this.enviar('ObtenerCategorias', '<tem:ObtenerCategorias />').pipe(
      map((xml) => this.convertirXMLACategorias(xml))
    );
  }

  obtenerProductos(): Observable<Producto[]> {
    return this.enviar('ObtenerProductos', '<tem:ObtenerProductos />').pipe(
      map((xml) => this.convertirXMLAProductos(xml))
    );
  }

  guardarCategoria(categoria: Categoria, editar: boolean): Observable<boolean> {
    const operacion = editar ? 'ActualizarCategoria' : 'AgregarCategoria';
    const campos = `<inv:Descripcion>${this.escaparXML(categoria.descripcion)}</inv:Descripcion><inv:Estado>${categoria.estado}</inv:Estado><inv:IdCategoria>${categoria.idCategoria}</inv:IdCategoria><inv:Nombre>${this.escaparXML(categoria.nombre)}</inv:Nombre>`;
    return this.enviar(operacion, `<tem:${operacion}><tem:categoria>${campos}</tem:categoria></tem:${operacion}>`).pipe(map(xml => {
      const resultado = this.documentoXML(xml).getElementsByTagNameNS('*', `${operacion}Result`)[0];
      return !!resultado && resultado.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance', 'nil') !== 'true';
    }));
  }

  eliminarCategoria(id: number): Observable<boolean> {
    return this.enviar('EliminarCategoria', `<tem:EliminarCategoria><tem:id>${id}</tem:id></tem:EliminarCategoria>`).pipe(
      map(xml => this.valorResultado(this.documentoXML(xml), 'EliminarCategoriaResult') === 'true')
    );
  }

  obtenerProducto(id: number): Observable<Producto | null> {
    const contenido = `<tem:ObtenerProducto><tem:id>${id}</tem:id></tem:ObtenerProducto>`;
    return this.enviar('ObtenerProducto', contenido).pipe(
      map((xml) => this.convertirXMLAProducto(xml, 'ObtenerProductoResult'))
    );
  }

  agregarProducto(producto: Producto): Observable<Producto | null> {
    const contenido = `<tem:AgregarProducto><tem:producto>${this.productoXML(producto)}</tem:producto></tem:AgregarProducto>`;
    return this.enviar('AgregarProducto', contenido).pipe(
      map((xml) => this.convertirXMLAProducto(xml, 'AgregarProductoResult'))
    );
  }

  actualizarProducto(producto: Producto): Observable<Producto | null> {
    const contenido = `<tem:ActualizarProducto><tem:producto>${this.productoXML(producto)}</tem:producto></tem:ActualizarProducto>`;
    return this.enviar('ActualizarProducto', contenido).pipe(
      map((xml) => this.convertirXMLAProducto(xml, 'ActualizarProductoResult'))
    );
  }

  eliminarProducto(id: number): Observable<boolean> {
    const contenido = `<tem:EliminarProducto><tem:id>${id}</tem:id></tem:EliminarProducto>`;
    return this.enviar('EliminarProducto', contenido).pipe(
      map((xml) => {
        const documento = this.documentoXML(xml);
        return this.valorResultado(documento, 'EliminarProductoResult') === 'true';
      })
    );
  }

  obtenerProductosPorPrecio(precioMinimo: number, precioMaximo: number): Observable<Producto[]> {
    const contenido = `<tem:ObtenerProductosPorPrecio><tem:precioMinimo>${precioMinimo.toFixed(2)}</tem:precioMinimo><tem:precioMaximo>${precioMaximo.toFixed(2)}</tem:precioMaximo></tem:ObtenerProductosPorPrecio>`;
    return this.enviar('ObtenerProductosPorPrecio', contenido).pipe(
      map((xml) => this.convertirXMLAProductos(xml))
    );
  }

  obtenerProductosPorCategoria(idCategoria: number): Observable<Producto[]> {
    const contenido = `<tem:ObtenerProductosPorCategoria><tem:idCategoria>${idCategoria}</tem:idCategoria></tem:ObtenerProductosPorCategoria>`;
    return this.enviar('ObtenerProductosPorCategoria', contenido).pipe(
      map((xml) => this.convertirXMLAProductos(xml))
    );
  }

  private enviar(operacion: string, contenido: string): Observable<string> {
    const sobre = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:inv="http://schemas.datacontract.org/2004/07/InventarioSOAP_A.Models">
        <soap:Header /><soap:Body>${contenido}</soap:Body>
      </soap:Envelope>`;
    const headers = new HttpHeaders({
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: `"http://tempuri.org/ICatalogoService/${operacion}"`
    });
    return this.http.post(this.url, sobre, { headers, responseType: 'text' }).pipe(timeout(15000));
  }

  private productoXML(producto: Producto): string {
    return `<inv:Descripcion>${this.escaparXML(producto.descripcion)}</inv:Descripcion>
      <inv:Estado>${producto.estado}</inv:Estado>
      <inv:IdCategoria>${producto.idCategoria}</inv:IdCategoria>
      <inv:IdProducto>${producto.idProducto}</inv:IdProducto>
      <inv:Nombre>${this.escaparXML(producto.nombre)}</inv:Nombre>
      <inv:Precio>${producto.precio.toFixed(2)}</inv:Precio>
      <inv:Stock>${producto.stock}</inv:Stock>`;
  }

  private convertirXMLACategorias(xml: string): Categoria[] {
    const nodos = this.documentoXML(xml).getElementsByTagNameNS('*', 'Categoria');
    return Array.from(nodos).map((nodo) => ({
      idCategoria: Number(this.valor(nodo, 'IdCategoria')),
      nombre: this.valor(nodo, 'Nombre'),
      descripcion: this.valor(nodo, 'Descripcion'),
      estado: this.valor(nodo, 'Estado') === 'true'
    }));
  }

  private convertirXMLAProductos(xml: string): Producto[] {
    const nodos = this.documentoXML(xml).getElementsByTagNameNS('*', 'Producto');
    return Array.from(nodos).map((nodo) => this.convertirNodoAProducto(nodo));
  }

  private convertirXMLAProducto(xml: string, nombreResultado: string): Producto | null {
    const resultado = this.documentoXML(xml).getElementsByTagNameNS('*', nombreResultado)[0];
    if (!resultado || resultado.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance', 'nil') === 'true') return null;
    return this.convertirNodoAProducto(resultado);
  }

  private convertirNodoAProducto(nodo: Element): Producto {
    return {
      idProducto: Number(this.valor(nodo, 'IdProducto')),
      nombre: this.valor(nodo, 'Nombre'),
      descripcion: this.valor(nodo, 'Descripcion'),
      precio: Number(this.valor(nodo, 'Precio')),
      stock: Number(this.valor(nodo, 'Stock')),
      estado: this.valor(nodo, 'Estado') === 'true',
      idCategoria: Number(this.valor(nodo, 'IdCategoria'))
    };
  }

  private documentoXML(xml: string): Document {
    const documento = new DOMParser().parseFromString(xml, 'text/xml');
    if (documento.getElementsByTagName('parsererror')[0]) throw new Error('El servicio devolvió una respuesta XML inválida.');
    return documento;
  }

  private valor(nodo: Element, nombre: string): string {
    return nodo.getElementsByTagNameNS('*', nombre)[0]?.textContent?.trim() ?? '';
  }

  private valorResultado(documento: Document, nombre: string): string {
    return documento.getElementsByTagNameNS('*', nombre)[0]?.textContent?.trim() ?? '';
  }

  private escaparXML(valor: string): string {
    return valor.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }
}
