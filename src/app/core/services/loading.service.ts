import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private activeRequests = 0;
  private showTimer: ReturnType<typeof setTimeout> | null = null;

  // Tiempo de espera antes de mostrar el spinner (ms)
  // Requests que terminan antes de este tiempo NO muestran el spinner
  private readonly DELAY_MS = 200;

  show(): void {
    this.activeRequests++;
    if (this.activeRequests === 1 && !this.showTimer) {
      // Solo programar si no hay ya un timer pendiente
      this.showTimer = setTimeout(() => {
        // Al dispararse, verificar que aún haya requests activos
        if (this.activeRequests > 0) {
          this.loadingSubject.next(true);
        }
        this.showTimer = null;
      }, this.DELAY_MS);
    }
  }

  hide(): void {
    this.activeRequests--;
    if (this.activeRequests <= 0) {
      this.activeRequests = 0;
      // Cancelar el timer si el request terminó antes del delay
      if (this.showTimer) {
        clearTimeout(this.showTimer);
        this.showTimer = null;
      }
      this.loadingSubject.next(false);
    }
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }
}