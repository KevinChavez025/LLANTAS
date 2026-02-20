import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pedido, CrearPedidoRequest, EstadoPedido } from '../models/pedido.model';
import { Page } from './producto.service';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/pedidos`;

  /** Crear pedido — público (usuarios registrados e invitados) */
  crearPedido(req: CrearPedidoRequest): Observable<Pedido> {
    return this.http.post<Pedido>(this.base, req);
  }

  /** Pedidos del usuario autenticado */
  obtenerMisPedidos(usuarioId: number): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.base}/usuario/${usuarioId}`);
  }

  /** Ver un pedido por ID — solo ADMIN */
  obtenerPorId(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.base}/${id}`);
  }

  /** Ver un pedido propio por ID — usuario autenticado */
  obtenerMiPedidoPorId(id: number): Observable<Pedido> {  // ✅ nuevo
    return this.http.get<Pedido>(`${this.base}/mis-pedidos/${id}`);
  }

  // ── Admin ─────────────────────────────────────────────────

  /** Todos los pedidos paginado (solo ADMIN) */
  obtenerTodosPaginado(page = 0, size = 20): Observable<Page<Pedido>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'fechaCreacion,desc');
    return this.http.get<Page<Pedido>>(this.base, { params });
  }

  /** Cambiar estado del pedido (solo ADMIN) */
  cambiarEstado(id: number, estado: EstadoPedido): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.base}/${id}/estado`, { estado });
  }
}
