import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay" *ngIf="loadingService.loading$ | async">
      <div class="spinner-container">
        <div class="spinner"></div>
        <p>Cargando...</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    .spinner-container {
      text-align: center;
    }

    .spinner {
      border: 4px solid rgba(29, 185, 84, 0.3);
      border-top: 4px solid #1DB954;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    p {
      color: white;
      font-size: 16px;
      font-weight: 600;
      text-shadow: 0 0 10px rgba(29, 185, 84, 0.8);
    }
  `]
})
export class LoadingSpinner {
  constructor(public loadingService: LoadingService) {}
}
