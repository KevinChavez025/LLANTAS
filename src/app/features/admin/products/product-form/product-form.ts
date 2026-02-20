import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProductoService } from '../../../../core/services/producto.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductForm implements OnInit {
  private svc    = inject(ProductoService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private fb     = inject(FormBuilder);
  private toastr = inject(ToastrService);

  form: FormGroup;
  esEdicion  = signal(false);
  productoId = signal<number | null>(null);
  cargando   = signal(false);
  guardando  = signal(false);

  tiposVehiculo = ['Auto', 'Moto', 'Mototaxi', 'Camion', 'SUV', 'Mineria', 'Bus'];
  categorias    = ['Delantero', 'Posterior', 'Mixto', 'Todo Terreno'];

  constructor() {
    this.form = this.fb.group({
      nombre:       ['', [Validators.required, Validators.maxLength(200)]],
      marca:        ['', [Validators.required, Validators.maxLength(100)]],
      modelo:       ['', Validators.maxLength(100)],
      tipoVehiculo: [''],
      medida:       ['', Validators.maxLength(50)],
      categoria:    [''],
      precio:       [null, [Validators.required, Validators.min(0.01)]],
      stock:        [0,    [Validators.required, Validators.min(0)]],
      descripcion:  [''],
      urlImagen:    [''],
      disponible:   [true],
      esNuevo:      [false],
      esDestacado:  [false],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.esEdicion.set(true); this.productoId.set(+id); this.cargando.set(true);
      this.svc.obtenerPorId(+id).subscribe({
        next: p => { this.form.patchValue(p); this.cargando.set(false); },
        error: () => { this.toastr.error('No se pudo cargar el producto'); this.router.navigate(['/admin/productos']); }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const op = this.esEdicion()
      ? this.svc.actualizar(this.productoId()!, this.form.value)
      : this.svc.crear(this.form.value);

    op.subscribe({
      next: () => {
        this.guardando.set(false);
        this.toastr.success(this.esEdicion() ? 'Producto actualizado' : 'Producto creado');
        this.router.navigate(['/admin/productos']);
      },
      error: () => this.guardando.set(false)
    });
  }

  get f() { return this.form.controls; }
}
