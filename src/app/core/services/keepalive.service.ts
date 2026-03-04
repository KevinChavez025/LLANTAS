import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { ProductoService } from './producto.service';

@Injectable({ providedIn: 'root' })
export class KeepaliveService {
  private http           = inject(HttpClient);
  private platformId     = inject(PLATFORM_ID);
  private productoService = inject(ProductoService);

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Precarga todos los productos al iniciar la app → quedan en cache
    // Cuando el usuario llegue al catálogo o home, carga instantáneo
    this.productoService.obtenerTodos().subscribe({ error: () => {} });
    this.productoService.obtenerDestacados().subscribe({ error: () => {} });
    this.productoService.obtenerNuevos().subscribe({ error: () => {} });

    // Refresca cache cada 9 min para que no quede desactualizado
    setInterval(() => {
      this.productoService.invalidarCache();
      this.productoService.obtenerTodos().subscribe({ error: () => {} });
    }, 9 * 60 * 1000);
  }
}