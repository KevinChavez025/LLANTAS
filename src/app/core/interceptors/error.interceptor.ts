import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // TOKEN_EXPIRED lo maneja auth.interceptor — sin toast aquí
      if (err.status === 401 && err.error?.error === 'TOKEN_EXPIRED') {
        return throwError(() => err);
      }

      const msg: Record<number, string> = {
        400: err.error?.message || 'Solicitud incorrecta',
        401: 'No autorizado. Inicia sesión nuevamente',
        403: 'No tienes permisos para esta acción',
        404: 'Recurso no encontrado',
        409: err.error?.message || 'Conflicto con datos existentes',
        429: 'Demasiados intentos. Espera un momento',
        500: 'Error interno del servidor',
        503: 'Servicio no disponible. Intenta más tarde',
      };

      toastr.error(msg[err.status] ?? err.error?.message ?? `Error ${err.status}`, 'Error');
      return throwError(() => err);
    })
  );
};
