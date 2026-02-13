import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pedido, CrearPedidoRequest, EstadoPedido } from '../models/pedido.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private endpoint = '/api/pedidos';

  constructor(private api: ApiService) {}

  /**
   * Crear pedido desde el checkout
   * POST /api/pedidos
   */
  crearPedido(request: CrearPedidoRequest): Observable<Pedido> {
    return this.api.post<Pedido>(this.endpoint, request);
  }

  /**
   * Obtener pedidos del usuario actual
   * GET /api/pedidos/mis-pedidos
   */
  obtenerMisPedidos(): Observable<Pedido[]> {
    return this.api.get<Pedido[]>(`${this.endpoint}/mis-pedidos`);
  }

  /**
   * Obtener detalle de un pedido
   * GET /api/pedidos/{id}
   */
  obtenerPorId(id: number): Observable<Pedido> {
    return this.api.get<Pedido>(`${this.endpoint}/${id}`);
  }

  // ========== ENDPOINTS ADMIN ==========

  /**
   * Obtener todos los pedidos (admin)
   * GET /api/pedidos
   */
  obtenerTodos(): Observable<Pedido[]> {
    return this.api.get<Pedido[]>(this.endpoint);
  }

  /**
   * Cambiar estado de un pedido (admin)
   * PUT /api/pedidos/{id}/estado
   */
  cambiarEstado(id: number, estado: EstadoPedido): Observable<Pedido> {
    return this.api.put<Pedido>(`${this.endpoint}/${id}/estado`, { estado });
  }
}
