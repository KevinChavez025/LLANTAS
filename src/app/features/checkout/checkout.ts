import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CarritoService } from '../../core/services/carrito.service';
import { MetodoPago } from '../../core/models/pedido.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AsyncPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout {
  private fb             = inject(FormBuilder);
  private router         = inject(Router);
  private carritoService = inject(CarritoService);
  private toastr         = inject(ToastrService);

  carrito$   = this.carritoService.carrito$;
  igv        = computed(() => Math.round(this.carritoService.getCarritoActual().subtotal * 0.18 * 100) / 100);
  total      = computed(() => Math.round((this.carritoService.getCarritoActual().subtotal + this.igv()) * 100) / 100);
  enviando   = signal(false);
  paso       = signal<1 | 2>(1); // 1=Dirección, 2=Pago

  metodosPago: { valor: MetodoPago; label: string; icono: string }[] = [
    { valor: 'EFECTIVO',        label: 'Efectivo',            icono: '💵' },
    { valor: 'YAPE',            label: 'Yape',                icono: '📱' },
    { valor: 'PLIN',            label: 'Plin',                icono: '📱' },
    { valor: 'TRANSFERENCIA',   label: 'Transferencia bancaria', icono: '🏦' },
    { valor: 'TARJETA_CREDITO', label: 'Tarjeta de crédito',  icono: '💳' },
    { valor: 'TARJETA_DEBITO',  label: 'Tarjeta de débito',   icono: '💳' },
  ];

  form: FormGroup = this.fb.group({
    // Paso 1 — Datos de entrega
    nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
    telefono:       ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    direccion:      ['', [Validators.required, Validators.minLength(5)]],
    distrito:       ['', Validators.required],
    ciudad:         ['Lima', Validators.required],
    referencia:     [''],
    // Paso 2 — Pago
    metodoPago:     ['', Validators.required],
    notas:          [''],
  });

  get f() { return this.form.controls; }

  siguientePaso(): void {
    const campos = ['nombreCompleto', 'telefono', 'direccion', 'distrito', 'ciudad'];
    campos.forEach(c => this.form.get(c)?.markAsTouched());
    const paso1Valido = campos.every(c => this.form.get(c)?.valid);
    if (paso1Valido) this.paso.set(2);
  }

  volverPaso1(): void {
    this.paso.set(1);
  }

  confirmarPedido(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);

    // TODO: conectar con PedidoService cuando el backend esté listo
    setTimeout(() => {
      this.carritoService.vaciar();
      this.enviando.set(false);
      this.toastr.success('¡Tu pedido fue registrado! Te contactaremos pronto.', 'Pedido confirmado');
      this.router.navigate(['/home']);
    }, 1500);
  }
}