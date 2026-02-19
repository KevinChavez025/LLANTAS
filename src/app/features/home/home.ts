import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Producto } from '../../core/models/producto.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  private http = inject(HttpClient);

  productoNuevos     = signal<Producto[]>([]);
  productoDestacados = signal<Producto[]>([]);

  categorias = [
    { nombre: 'Automóvil',           query: 'Auto',     img: 'https://placehold.co/180x120/1DB954/ffffff?text=Auto'     },
    { nombre: 'Moto / ATV',          query: 'Moto',     img: 'https://placehold.co/180x120/16a34a/ffffff?text=Moto'     },
    { nombre: 'Mototaxi',            query: 'Mototaxi', img: 'https://placehold.co/180x120/15803d/ffffff?text=Mototaxi' },
    { nombre: 'Camión / Bus',        query: 'Camion',   img: 'https://placehold.co/180x120/166534/ffffff?text=Camión'   },
    { nombre: '4x4 / SUV',           query: 'SUV',      img: 'https://placehold.co/180x120/14532d/ffffff?text=4x4+SUV'  },
    { nombre: 'Minería / Industrial', query: 'Mineria',  img: 'https://placehold.co/180x120/052e16/ffffff?text=Minería'  },
  ];

  ngOnInit(): void {
    this.http.get<Producto[]>('assets/data/mock-products.json').subscribe(productos => {
      this.productoNuevos.set(
        productos.filter(p => p.esNuevo).slice(0, 8)
      );
      this.productoDestacados.set(
        productos.filter(p => p.esDestacado).slice(0, 8)
      );
    });
  }
}