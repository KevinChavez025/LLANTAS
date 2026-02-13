import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private endpoint = '/api/usuarios';

  constructor(private api: ApiService) {}

  /**
   * Obtener perfil del usuario actual
   * GET /api/usuarios/perfil
   */
  obtenerPerfil(): Observable<Usuario> {
    return this.api.get<Usuario>(`${this.endpoint}/perfil`);
  }

  /**
   * Actualizar perfil del usuario actual
   * PUT /api/usuarios/perfil
   */
  actualizarPerfil(usuario: Partial<Usuario>): Observable<Usuario> {
    return this.api.put<Usuario>(`${this.endpoint}/perfil`, usuario);
  }

  // ========== ENDPOINTS ADMIN ==========

  /**
   * Obtener todos los usuarios (admin)
   * GET /api/usuarios
   */
  obtenerTodos(): Observable<Usuario[]> {
    return this.api.get<Usuario[]>(this.endpoint);
  }

  /**
   * Obtener usuario por ID (admin)
   * GET /api/usuarios/{id}
   */
  obtenerPorId(id: number): Observable<Usuario> {
    return this.api.get<Usuario>(`${this.endpoint}/${id}`);
  }

  /**
   * Activar/desactivar usuario (admin)
   * PUT /api/usuarios/{id}/estado
   */
  cambiarEstado(id: number, activo: boolean): Observable<Usuario> {
    return this.api.put<Usuario>(`${this.endpoint}/${id}/estado`, { activo });
  }
}
