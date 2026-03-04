import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MetodoPagoGuardado, CrearMetodoPagoDTO } from '../models/metodo-pago-guardado.model';

@Injectable({ providedIn: 'root' })
export class MetodoPagoGuardadoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/usuarios/metodos-pago`;

  obtenerTodos(): Observable<MetodoPagoGuardado[]> {
    return this.http.get<MetodoPagoGuardado[]>(this.base);
  }

  crear(dto: CrearMetodoPagoDTO): Observable<MetodoPagoGuardado> {
    return this.http.post<MetodoPagoGuardado>(this.base, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  marcarPrincipal(id: number): Observable<MetodoPagoGuardado> {
    return this.http.patch<MetodoPagoGuardado>(`${this.base}/${id}/principal`, {});
  }
}