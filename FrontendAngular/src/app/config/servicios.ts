// Cambia aquí las URL si ejecutas el backend en otro equipo o puerto.
export const SERVICIOS = {
  soap: 'http://localhost:5163/CatalogoService.svc',
  movimientos: 'http://localhost:5163/api/MovimientoInventario',
  catalogoExterno: 'https://dummyjson.com/products'
} as const;
