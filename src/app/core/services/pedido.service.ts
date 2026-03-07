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

  crearPedido(req: CrearPedidoRequest): Observable<Pedido> {
    return this.http.post<Pedido>(this.base, req);
  }

  obtenerMisPedidos(usuarioId: number): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.base}/usuario/${usuarioId}`);
  }

  obtenerPorId(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.base}/${id}`);
  }

  // ── Admin ──────────────────────────────────────────────────

  obtenerTodosPaginado(
    page = 0,
    size = 20,
    fechaDesde = '',
    fechaHasta = '',
    estado: EstadoPedido | '' = '',
    soloRecojo = false
  ): Observable<Page<Pedido>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'fechaCreacion,desc');
    if (fechaDesde)  params = params.set('fechaDesde', fechaDesde);
    if (fechaHasta)  params = params.set('fechaHasta', fechaHasta);
    if (estado)      params = params.set('estado', estado);
    if (soloRecojo)  params = params.set('recojo', 'true');
    return this.http.get<Page<Pedido>>(this.base, { params });
  }

  cambiarEstado(id: number, estado: EstadoPedido): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.base}/${id}/estado`, { estado });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/stats`);
  }
}

export interface DashboardStats {
  totalPedidos: number;
  pedidosPendientes: number;
  pedidosEntregados: number;
  ingresoTotal: number;
  pedidosHoy: number;
  ingresosHoy: number;
  recojosPendientesCount: number;
  recojosPendientes: RecojoItem[];
}

export interface RecojoItem {
  id: number;
  numeroPedido: string;
  nombreCliente: string;
  telefonoContacto: string;
  estado: string;
  total: number;
}