import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PedidoService } from '../../../../core/services/pedido.service';
import { Pedido, ESTADO_PEDIDO_LABEL, ESTADO_PAGO_LABEL, METODO_PAGO_LABEL } from '../../../../core/models/pedido.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss'
})
export class OrderDetail implements OnInit {
  private pedidos = inject(PedidoService);
  private route   = inject(ActivatedRoute);

  pedido   = signal<Pedido | null>(null);
  cargando = signal(true);
  error    = signal(false);

  readonly ESTADO_LABEL = ESTADO_PEDIDO_LABEL;
  readonly PAGO_LABEL   = ESTADO_PAGO_LABEL;
  readonly METODO_LABEL = METODO_PAGO_LABEL;

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.pedidos.obtenerPorId(id).subscribe({
      next: d => { this.pedido.set(d); this.cargando.set(false); },
      error: () => { this.error.set(true); this.cargando.set(false); }
    });
  }
}
