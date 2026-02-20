import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../core/services/producto.service';
import { Producto } from '../../core/models/producto.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  private productoService = inject(ProductoService);

  productoDestacados = signal<Producto[]>([]);
  productoNuevos     = signal<Producto[]>([]);
  cargando           = signal(true);

  categorias = [
    { nombre: 'Automóvil',            query: 'Auto',     img: 'https://placehold.co/180x120/1DB954/ffffff?text=Auto'     },
    { nombre: 'Moto / ATV',           query: 'Moto',     img: 'https://placehold.co/180x120/16a34a/ffffff?text=Moto'     },
    { nombre: 'Mototaxi',             query: 'Mototaxi', img: 'https://placehold.co/180x120/15803d/ffffff?text=Mototaxi' },
    { nombre: 'Camión / Bus',         query: 'Camion',   img: 'https://placehold.co/180x120/166534/ffffff?text=Camión'   },
    { nombre: '4x4 / SUV',            query: 'SUV',      img: 'https://placehold.co/180x120/14532d/ffffff?text=4x4+SUV'  },
    { nombre: 'Minería / Industrial',  query: 'Mineria',  img: 'https://placehold.co/180x120/052e16/ffffff?text=Minería'  },
  ];

  ngOnInit(): void {
    this.productoService.obtenerDestacados().subscribe({
      next: d => { this.productoDestacados.set(d.slice(0, 8)); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
    this.productoService.obtenerNuevos().subscribe({
      next: d => this.productoNuevos.set(d.slice(0, 8))
    });
  }
}
