import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CarritoService } from '../../core/services/carrito.service';
import { PedidoService } from '../../core/services/pedido.service';
import { AuthService } from '../../core/services/auth.service';
import { MetodoPago, CrearPedidoRequest } from '../../core/models/pedido.model';
import { UBICACIONES_PERU, Departamento, Provincia } from '../../core/data/ubicaciones-peru';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AsyncPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout {
  private fb      = inject(FormBuilder);
  private router  = inject(Router);
  private carrito = inject(CarritoService);
  private pedidos = inject(PedidoService);
  private auth    = inject(AuthService);
  private toastr  = inject(ToastrService);

  carrito$   = this.carrito.carrito$;
  igv        = computed(() => Math.round(this.carrito.getCarritoActual().subtotal * 0.18 * 100) / 100);
  costoEnvio = 15;
  total      = computed(() =>
    Math.round((this.carrito.getCarritoActual().subtotal + this.igv() + this.costoEnvio) * 100) / 100);

  enviando = signal(false);
  paso     = signal<1 | 2>(1);

  esUsuarioLogueado = !!this.auth.getCurrentUser();

  // ── Ubicaciones Perú ──
  departamentos: Departamento[] = UBICACIONES_PERU;
  provincias: Provincia[] = [];
  distritos: string[] = [];

  metodosPago: { valor: MetodoPago; label: string; icono: string }[] = [
    { valor: 'EFECTIVO',        label: 'Efectivo',               icono: '💵' },
    { valor: 'YAPE',            label: 'Yape',                   icono: '📱' },
    { valor: 'PLIN',            label: 'Plin',                   icono: '📱' },
    { valor: 'TRANSFERENCIA',   label: 'Transferencia bancaria', icono: '🏦' },
    { valor: 'TARJETA_CREDITO', label: 'Tarjeta de crédito',     icono: '💳' },
    { valor: 'TARJETA_DEBITO',  label: 'Tarjeta de débito',      icono: '💳' },
  ];

  form: FormGroup = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
    email:          ['', this.esUsuarioLogueado ? [Validators.email] : [Validators.required, Validators.email]],
    telefono:       ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    direccion:      ['', [Validators.required, Validators.minLength(5)]],
    departamento:   ['', Validators.required],
    ciudad:         ['', Validators.required],
    distrito:       ['', Validators.required],
    referencia:     [''],
    metodoPago:     ['', Validators.required],
    notas:          [''],
  });

  get f() { return this.form.controls; }

  onDepartamentoChange(event: Event): void {
    const nombre = (event.target as HTMLSelectElement).value;
    const dep = this.departamentos.find(d => d.nombre === nombre);
    this.provincias = dep ? dep.provincias : [];
    this.distritos  = [];
    this.form.patchValue({ ciudad: '', distrito: '' });
  }

  onProvinciaChange(event: Event): void {
    const nombre = (event.target as HTMLSelectElement).value;
    const prov = this.provincias.find(p => p.nombre === nombre);
    this.distritos = prov ? prov.distritos : [];
    this.form.patchValue({ distrito: '' });
  }

  siguientePaso(): void {
    const campos = ['nombreCompleto', 'telefono', 'direccion', 'departamento', 'ciudad', 'distrito'];
    if (!this.esUsuarioLogueado) campos.push('email');
    campos.forEach(c => this.form.get(c)?.markAsTouched());
    if (campos.every(c => this.form.get(c)?.valid)) this.paso.set(2);
  }

  volverPaso1(): void { this.paso.set(1); }

  confirmarPedido(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const usuario = this.auth.getCurrentUser();
    const v = this.form.value;

    const request: CrearPedidoRequest = {
      direccionEnvio:    v.direccion + (v.referencia ? ` (Ref: ${v.referencia})` : ''),
      ciudad:            v.ciudad,
      distrito:          v.distrito,
      departamento:      v.departamento,
      telefonoContacto:  v.telefono,
      metodoPago:        v.metodoPago,
      notasAdicionales:  v.notas || undefined,
      idempotencyKey:    crypto.randomUUID(),
      ...(usuario && { usuarioId: usuario.id }),
      ...(!usuario && {
        nombreCliente:   v.nombreCompleto,
        emailCliente:    v.email,
        telefonoCliente: v.telefono,
        sessionId:       this.carrito.getSessionId(),
      })
    };

    this.enviando.set(true);
    this.pedidos.crearPedido(request).subscribe({
      next: pedido => {
        this.carrito.vaciar();
        this.enviando.set(false);
        this.toastr.success(
          `Pedido ${pedido.numeroPedido} registrado. ¡Te contactaremos pronto!`,
          '¡Pedido confirmado!'
        );
        this.router.navigate(usuario ? ['/usuario/pedidos'] : ['/home']);
      },
      error: () => this.enviando.set(false)
    });
  }
}