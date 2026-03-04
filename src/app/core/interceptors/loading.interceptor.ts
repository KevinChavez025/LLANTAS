import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

// Requests que NO deben mostrar el spinner global
// (operaciones silenciosas en segundo plano)
const SILENT_URLS = [
  '/api/carrito/agregar',
  '/api/carrito/item',
  '/api/carrito/vaciar',
  '/api/auth/refresh',
];

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  const isSilent = SILENT_URLS.some(url => req.url.includes(url));
  if (isSilent) {
    return next(req);
  }

  loadingService.show();

  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};