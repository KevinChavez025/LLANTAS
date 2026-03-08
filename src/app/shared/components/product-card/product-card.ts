import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Producto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  @Input({ required: true }) product!: Producto;
  @Input() isFav = false;

  @Output() addToCart = new EventEmitter<Producto>();
  @Output() toggleFav = new EventEmitter<Producto>();

  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }

  onToggleFav(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggleFav.emit(this.product);
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/placeholder-llanta.webp';
  }
}
