import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { SERVICIOS } from '../config/servicios';
import { MovimientoInventario } from '../Model/movimiento.model';

@Injectable({ providedIn: 'root' })
export class MovimientosService {
  private readonly http = inject(HttpClient);
  listar() { return this.http.get<MovimientoInventario[]>(SERVICIOS.movimientos).pipe(timeout(15000)); }
  obtener(id: number) { return this.http.get<MovimientoInventario>(`${SERVICIOS.movimientos}/${id}`).pipe(timeout(15000)); }
  guardar(m: MovimientoInventario) { return this.http.post<MovimientoInventario>(SERVICIOS.movimientos, m).pipe(timeout(15000)); }
  actualizar(m: MovimientoInventario) { return this.http.put<void>(`${SERVICIOS.movimientos}/${m.idMovimiento}`, m).pipe(timeout(15000)); }
  eliminar(id: number) { return this.http.delete<void>(`${SERVICIOS.movimientos}/${id}`).pipe(timeout(15000)); }
}
