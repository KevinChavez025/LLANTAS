import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto, CrearProductoDTO, ProductoFiltros } from '../models/producto.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private endpoint = '/api/productos';

  constructor(private api: ApiService) {}

  // ========== ENDPOINTS PÚBLICOS ==========

  /**
   * Obtener todos los productos
   * GET /api/productos
   */
  obtenerTodos(): Observable<Producto[]> {
    return this.api.get<Producto[]>(this.endpoint);
  }

  /**
   * Obtener producto por ID
   * GET /api/productos/{id}
   */
  obtenerPorId(id: number): Observable<Producto> {
    return this.api.get<Producto>(`${this.endpoint}/${id}`);
  }

  /**
   * Obtener productos con filtros
   * GET /api/productos?marca=Kumho&tipoVehiculo=Auto
   */
  obtenerConFiltros(filtros: ProductoFiltros): Observable<Producto[]> {
    let params = new HttpParams();

    if (filtros.marca) params = params.set('marca', filtros.marca);
    if (filtros.tipoVehiculo) params = params.set('tipoVehiculo', filtros.tipoVehiculo);
    if (filtros.categoria) params = params.set('categoria', filtros.categoria);
    if (filtros.precioMin !== undefined) params = params.set('precioMin', filtros.precioMin.toString());
    if (filtros.precioMax !== undefined) params = params.set('precioMax', filtros.precioMax.toString());
    if (filtros.disponible !== undefined) params = params.set('disponible', filtros.disponible.toString());
    if (filtros.esNuevo !== undefined) params = params.set('esNuevo', filtros.esNuevo.toString());
    if (filtros.esDestacado !== undefined) params = params.set('esDestacado', filtros.esDestacado.toString());
    if (filtros.textoBusqueda) params = params.set('q', filtros.textoBusqueda);

    return this.api.get<Producto[]>(this.endpoint, params);
  }

  /**
   * Obtener productos destacados
   */
  obtenerDestacados(): Observable<Producto[]> {
    return this.obtenerConFiltros({ esDestacado: true });
  }

  /**
   * Obtener productos nuevos
   */
  obtenerNuevos(): Observable<Producto[]> {
    return this.obtenerConFiltros({ esNuevo: true });
  }

  /**
   * Buscar productos por texto
   */
  buscar(termino: string): Observable<Producto[]> {
    return this.obtenerConFiltros({ textoBusqueda: termino });
  }

  // ========== ENDPOINTS ADMIN (requieren autenticación) ==========

  /**
   * Crear producto
   * POST /api/productos
   */
  crear(producto: CrearProductoDTO): Observable<Producto> {
    return this.api.post<Producto>(this.endpoint, producto);
  }

  /**
   * Actualizar producto
   * PUT /api/productos/{id}
   */
  actualizar(id: number, producto: Partial<Producto>): Observable<Producto> {
    return this.api.put<Producto>(`${this.endpoint}/${id}`, producto);
  }

  /**
   * Eliminar producto
   * DELETE /api/productos/{id}
   */
  eliminar(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Subir imagen de producto
   * POST /api/productos/{id}/imagen
   */
  subirImagen(id: number, file: File): Observable<Producto> {
    return this.api.uploadFile<Producto>(`${this.endpoint}/${id}/imagen`, file);
  }
}
