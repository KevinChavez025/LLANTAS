import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ProductoService } from '../../core/services/producto.service';
import { Producto } from '../../core/models/producto.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  private productoService = inject(ProductoService);
  private router          = inject(Router);
  private sanitizer       = inject(DomSanitizer);

  productoDestacados = signal<Producto[]>([]);
  productoNuevos     = signal<Producto[]>([]);
  cargando           = signal(true);

  // ── WhatsApp ──────────────────────────────────────────────
  readonly whatsappNumero  = '51999999999'; // ← cambia por el número real
  readonly whatsappMensaje = encodeURIComponent('Hola, quisiera consultar sobre llantas.');
  readonly whatsappUrl     = `https://wa.me/${this.whatsappNumero}?text=${this.whatsappMensaje}`;

  // ── Hero image ────────────────────────────────────────────
  // Pon aquí el nombre de tu archivo en /public, ej: 'hero-banner.jpg'
  private readonly heroImgPath = 'HeroSection.webp';

  get heroStyle(): SafeStyle | null {
    if (!this.heroImgPath) return null;
    return this.sanitizer.bypassSecurityTrustStyle(`url('${this.heroImgPath}')`);
  }

  get hasHeroImg(): boolean {
    return !!this.heroImgPath;
  }

  // ── Buscador por medida ───────────────────────────────────
  anchoSeleccionado        = '';
  perfilSeleccionado       = '';
  aroSeleccionado          = '';
  tipoVehiculoSeleccionado = '';

  readonly anchos = [
    '125','135','145','155','165','175','185','195',
    '205','215','225','235','245','255','265','275',
    '285','295','305','315','325','335'
  ];

  readonly perfiles = [
    '30','35','40','45','50','55','60','65','70','75','80'
  ];

  readonly aros = [
    '12','13','14','15','16','17','18','19','20','22','24',
    '6.00','7.00','8.00','9.00'
  ];

  readonly tiposVehiculo = [
    'Auto', 'Moto', 'Camion', 'SUV', 'Mineria'
  ];

  buscarPorMedida(): void {
    const queryParams: Record<string, string> = {};
    if (this.anchoSeleccionado)        queryParams['ancho']  = this.anchoSeleccionado;
    if (this.perfilSeleccionado)       queryParams['perfil'] = this.perfilSeleccionado;
    if (this.aroSeleccionado)          queryParams['aro']    = this.aroSeleccionado;
    if (this.tipoVehiculoSeleccionado) queryParams['tipo']   = this.tipoVehiculoSeleccionado;
    this.router.navigate(['/catalogo'], { queryParams });
  }

  ngOnInit(): void {
    this.productoService.obtenerDestacados().subscribe({
      next: d => { this.productoDestacados.set(d.slice(0, 8)); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
    this.productoService.obtenerNuevos().subscribe({
      next: d => this.productoNuevos.set(d.slice(0, 8)),
      error: () => console.error('Error al cargar productos nuevos')
    });
  }
}