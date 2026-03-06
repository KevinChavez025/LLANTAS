import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, AsyncPipe, LowerCasePipe, DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { MetodoPagoGuardadoService } from '../../../core/services/metodo-pago-guardado.service';
import { MetodoPagoGuardado, TipoMetodoPago } from '../../../core/models/metodo-pago-guardado.model';
import { FavoritosService } from '../../../core/services/favoritos.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { Pedido } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AsyncPipe, LowerCasePipe, DecimalPipe, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  private auth      = inject(AuthService);
  private svc       = inject(UsuarioService);
  private metodoSvc    = inject(MetodoPagoGuardadoService);
  private favSvc       = inject(FavoritosService);
  private pedidoSvc    = inject(PedidoService);
  private fb        = inject(FormBuilder);
  private toastr    = inject(ToastrService);

  usuario   = this.auth.currentUser$;
  guardando = signal(false);
  editando  = signal(false);

  metodosGuardados = signal<MetodoPagoGuardado[]>([]);
  cargandoMetodos  = signal(false);
  ultimaCompras    = signal<Pedido[]>([]);
  modalAbierto     = signal(false);
  guardandoMetodo  = signal(false);

  tiposDisponibles: { valor: TipoMetodoPago; label: string; icono: string }[] = [
    { valor: 'YAPE',            label: 'Yape',             icono: '💜' },
    { valor: 'PLIN',            label: 'Plin',             icono: '💙' },
    { valor: 'TARJETA_CREDITO', label: 'Tarjeta crédito',  icono: '💳' },
    { valor: 'TARJETA_DEBITO',  label: 'Tarjeta débito',   icono: '🏧' },
    { valor: 'TRANSFERENCIA',   label: 'Transferencia',    icono: '🏦' },
  ];

  form: FormGroup = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
    telefono:       ['', Validators.pattern(/^[0-9]{9}$/)],
    direccion:      [''],
    ciudad:         [''],
    distrito:       [''],
  });

  formMetodo: FormGroup = this.fb.group({
    tipo:        ['', Validators.required],
    alias:       ['', Validators.required],
    detalle:     ['', Validators.required],
    esPrincipal: [false],
  });

  ngOnInit(): void {
    this._cargarUltimasCompras();
    this.svc.obtenerPerfil().subscribe({
      next: (u) => this.form.patchValue(u),
      error: () => {
        const user = this.auth.getCurrentUser();
        if (user) this.form.patchValue({ nombreCompleto: user.nombre });
      }
    });
    this.cargarMetodos();
  }

  get f() { return this.form.controls; }
  get fm() { return this.formMetodo.controls; }

  toggleEditar(): void { this.editando.update(v => !v); }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    this.svc.actualizarPerfil(this.form.value).subscribe({
      next: () => {
        this.guardando.set(false);
        this.editando.set(false);
        this.toastr.success('Perfil actualizado correctamente', '¡Listo!');
      },
      error: () => {
        this.guardando.set(false);
        this.toastr.error('No se pudo actualizar el perfil', 'Error');
      }
    });
  }

  cancelar(): void {
    this.editando.set(false);
    this.ngOnInit();
  }

  cargarMetodos(): void {
    this.cargandoMetodos.set(true);
    this.metodoSvc.obtenerTodos().subscribe({
      next: (lista) => { this.metodosGuardados.set(lista); this.cargandoMetodos.set(false); },
      error: () => this.cargandoMetodos.set(false)
    });
  }

  getIconoMetodo(tipo: TipoMetodoPago): string {
    return this.tiposDisponibles.find(t => t.valor === tipo)?.icono ?? '💳';
  }

  abrirModalAgregar(): void {
    this.formMetodo.reset({ tipo: '', alias: '', detalle: '', esPrincipal: false });
    this.modalAbierto.set(true);
  }

  cerrarModal(): void { this.modalAbierto.set(false); }

  onTipoChange(): void {
    this.formMetodo.patchValue({ detalle: '' });
    const tipo = this.fm['tipo'].value as TipoMetodoPago;
    let v = [Validators.required];
    if (tipo === 'YAPE' || tipo === 'PLIN') {
      v = [Validators.required, Validators.pattern(/^[0-9]{9}$/)];
    } else if (tipo === 'TARJETA_CREDITO' || tipo === 'TARJETA_DEBITO') {
      v = [Validators.required, Validators.pattern(/^[0-9]{4}$/)];
    }
    this.formMetodo.get('detalle')?.setValidators(v);
    this.formMetodo.get('detalle')?.updateValueAndValidity();
  }

  guardarMetodo(): void {
    if (this.formMetodo.invalid) { this.formMetodo.markAllAsTouched(); return; }
    this.guardandoMetodo.set(true);
    const tipo = this.fm['tipo'].value as TipoMetodoPago;
    let detalle = this.fm['detalle'].value as string;
    if (tipo === 'TARJETA_CREDITO' || tipo === 'TARJETA_DEBITO') {
      detalle = `•••• •••• •••• ${detalle}`;
    }
    this.metodoSvc.crear({ tipo, alias: this.fm['alias'].value, detalle, esPrincipal: this.fm['esPrincipal'].value }).subscribe({
      next: () => {
        this.guardandoMetodo.set(false);
        this.cerrarModal();
        this.cargarMetodos();
        this.toastr.success('Método de pago guardado', '¡Listo!');
      },
      error: () => {
        this.guardandoMetodo.set(false);
        this.toastr.error('No se pudo guardar el método', 'Error');
      }
    });
  }

  marcarPrincipal(id: number): void {
    this.metodoSvc.marcarPrincipal(id).subscribe({
      next: () => { this.cargarMetodos(); this.toastr.success('Método principal actualizado'); },
      error: () => this.toastr.error('No se pudo actualizar', 'Error')
    });
  }

  eliminarMetodo(id: number): void {
    if (!confirm('¿Eliminar este método de pago?')) return;
    this.metodoSvc.eliminar(id).subscribe({
      next: () => { this.cargarMetodos(); this.toastr.success('Método eliminado'); },
      error: () => this.toastr.error('No se pudo eliminar', 'Error')
    });
  }

  // ── Favoritos ─────────────────────────────────────────────
  favoritos = this.favSvc.favoritos;

  quitarFavorito(event: Event, id: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.favSvc.eliminar(id);
  }

  limpiarFavoritos(): void {
    if (confirm('¿Eliminar todos tus favoritos?')) {
      this.favSvc.limpiar();
    }
  }
  private _cargarUltimasCompras(): void {
    this.auth.currentUser$.subscribe(user => {
      if (user?.id) {
        this.pedidoSvc.obtenerMisPedidos(user.id).subscribe({
          next: pedidos => this.ultimaCompras.set(pedidos.slice(0, 5)),
          error: () => {}
        });
      }
    });
  }

  estadoLabel(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente', CONFIRMADO: 'Confirmado',
      EN_PREPARACION: 'En preparación', ENVIADO: 'Enviado',
      ENTREGADO: 'Entregado', CANCELADO: 'Cancelado',
    };
    return map[estado] ?? estado;
  }

  estadoBadge(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'badge--warning', CONFIRMADO: 'badge--info',
      EN_PREPARACION: 'badge--info', ENVIADO: 'badge--primary',
      ENTREGADO: 'badge--success', CANCELADO: 'badge--danger',
    };
    return map[estado] ?? 'badge--secondary';
  }

  getItems(pedido: Pedido) {
    return pedido.detalles || (pedido as any).items || [];
  }

}