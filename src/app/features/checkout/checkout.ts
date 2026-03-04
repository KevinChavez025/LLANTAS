import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CarritoService } from '../../core/services/carrito.service';
import { PedidoService } from '../../core/services/pedido.service';
import { AuthService } from '../../core/services/auth.service';
import { MetodoPagoGuardadoService } from '../../core/services/metodo-pago-guardado.service';
import { MetodoPagoGuardado, TipoMetodoPago } from '../../core/models/metodo-pago-guardado.model';
import { MetodoPago, CrearPedidoRequest } from '../../core/models/pedido.model';
import { UBICACIONES_PERU, Departamento, Provincia } from '../../core/data/ubicaciones-peru';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AsyncPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout implements OnInit {
  private fb        = inject(FormBuilder);
  private router    = inject(Router);
  private carrito   = inject(CarritoService);
  private pedidos   = inject(PedidoService);
  private auth      = inject(AuthService);
  private toastr    = inject(ToastrService);
  private metodoSvc = inject(MetodoPagoGuardadoService);

  carrito$   = this.carrito.carrito$;
  igv        = computed(() => Math.round(this.carrito.getCarritoActual().subtotal * 0.18 * 100) / 100);
  costoEnvio = 15;
  total      = computed(() =>
    Math.round((this.carrito.getCarritoActual().subtotal + this.igv() + this.costoEnvio) * 100) / 100);

  enviando = signal(false);
  paso     = signal<1 | 2>(1);

  // Métodos guardados del usuario
  metodosGuardados   = signal<MetodoPagoGuardado[]>([]);
  metodoSeleccionado = signal<string>('');  // 'guardado-{id}' o 'nuevo-{tipo}'
  usarMetodoGuardado = signal(false);

  esUsuarioLogueado = !!this.auth.getCurrentUser();

  departamentos: Departamento[] = UBICACIONES_PERU;
  provincias: Provincia[] = [];
  distritos: string[] = [];

  // Métodos de pago NO tarjeta (manuales)
  metodosManualPago: { valor: MetodoPago; label: string; icono: string; descripcion: string }[] = [
    { valor: 'YAPE',          label: 'Yape',                   icono: '💜', descripcion: 'Paga con tu app Yape' },
    { valor: 'PLIN',          label: 'Plin',                   icono: '💙', descripcion: 'Paga con tu app Plin' },
    { valor: 'TRANSFERENCIA', label: 'Transferencia bancaria', icono: '🏦', descripcion: 'BCP / Interbank / BBVA' },
  ];

  // Método tarjeta (Culqi)
  mostrarFormCulqi = signal(false);
  culqiCargado     = signal(false);

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

  ngOnInit(): void {
    // Prellenar datos del usuario logueado
    if (this.esUsuarioLogueado) {
      const user = this.auth.getCurrentUser();
      if (user) {
        this.form.patchValue({
          nombreCompleto: user.nombre || '',
          email: user.email || '',
        });
      }
      // Cargar métodos guardados
      this.metodoSvc.obtenerTodos().subscribe({
        next: (lista: MetodoPagoGuardado[]) => this.metodosGuardados.set(lista),
        error: () => {}
      });
    }
  }

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

  seleccionarMetodo(valor: string): void {
    this.metodoSeleccionado.set(valor);
    this.mostrarFormCulqi.set(false);

    if (valor === 'TARJETA_CREDITO' || valor === 'TARJETA_DEBITO') {
      this.form.patchValue({ metodoPago: valor });
      this.mostrarFormCulqi.set(true);
      this.iniciarCulqi(valor as MetodoPago);
    } else if (valor.startsWith('guardado-')) {
      const id = parseInt(valor.split('-')[1], 10);
      const metodo = this.metodosGuardados().find(m => m.id === id);
      if (metodo) this.form.patchValue({ metodoPago: metodo.tipo });
    } else {
      this.form.patchValue({ metodoPago: valor });
    }
  }

  iniciarCulqi(tipo: MetodoPago): void {
    // Aquí integras el SDK de Culqi
    // https://docs.culqi.com/es/documentacion/checkout/v4/javascript/
    // Por ahora marcamos como listo para mostrar el formulario
    this.culqiCargado.set(true);
    // Ejemplo de configuración Culqi:
    // Culqi.publicKey = 'pk_test_xxxx';
    // Culqi.settings({ title: 'HaidaInversiones Llantas', currency: 'PEN', amount: this.total() * 100 });
    // Culqi.open();
  }

  confirmarPedido(): void {
    if (this.form.invalid || !this.metodoSeleccionado()) {
      this.form.markAllAsTouched();
      return;
    }
    const usuario = this.auth.getCurrentUser();
    const v = this.form.value;

    const request: CrearPedidoRequest = {
      direccionEnvio:   v.direccion + (v.referencia ? ` (Ref: ${v.referencia})` : ''),
      ciudad:           v.ciudad,
      distrito:         v.distrito,
      departamento:     v.departamento,
      telefonoContacto: v.telefono,
      metodoPago:       v.metodoPago,
      notasAdicionales: v.notas || undefined,
      idempotencyKey:   crypto.randomUUID(),
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

  getIconoTipo(tipo: TipoMetodoPago): string {
    const map: Record<string, string> = {
      YAPE: '💜', PLIN: '💙', TARJETA_CREDITO: '💳',
      TARJETA_DEBITO: '🏧', TRANSFERENCIA: '🏦'
    };
    return map[tipo] ?? '💳';
  }
}