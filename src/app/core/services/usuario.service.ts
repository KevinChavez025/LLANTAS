import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/usuarios`;

  /** Perfil del usuario autenticado — usa /perfil en lugar de /{id} */
  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/perfil`);
  }

  /** Solo para ADMIN */
  obtenerTodos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.base);
  }

  /** Solo para ADMIN */
  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/${id}`);
  }

  /** Actualizar perfil propio */
  actualizarPerfil(data: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.base}/perfil`, data);
  }

  /** Solo para ADMIN */
  actualizar(id: number, data: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.base}/${id}`, data);
  }

  toggleActivo(id: number, activo: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.base}/${id}/activo`, { activo });
  }
}