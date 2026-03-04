import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

// Requests que NO deben mostrar el spinner global
const SILENT_URLS = [
  '/api/productos',
  '/api/carrito',
  '/api/auth/refresh',
  '/api/pedidos/usuario',
];

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  const isSilent = SILENT_URLS.some(url => req.url.includes(url));
  if (isSilent) return next(req);

  loadingService.show();
  return next(req).pipe(finalize(() => loadingService.hide()));
};