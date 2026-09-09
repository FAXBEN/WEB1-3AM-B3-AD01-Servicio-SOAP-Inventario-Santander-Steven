export interface MovimientoInventario {
  idMovimiento: number;
  idProducto: number;
  tipoMovimiento: 'ENTRADA' | 'SALIDA';
  cantidad: number;
  fechaMovimiento: string;
  observacion: string | null;
}
