import { Usuario } from './usuario.model';
import { Producto } from './producto.model';

export type EstadoPedido =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'EN_PREPARACION'
  | 'ENVIADO'
  | 'ENTREGADO'
  | 'CANCELADO';

export type MetodoPago =
  | 'EFECTIVO'
  | 'YAPE'
  | 'PLIN'
  | 'TRANSFERENCIA'
  | 'TARJETA'
  | 'MERCADO_PAGO';

export interface DireccionEnvio {
  nombreCompleto: string;
  telefono: string;
  direccion: string;
  distrito: string;
  ciudad: string;
  codigoPostal?: string;
  referencia?: string;
}

export interface DetallePedido {
  id: number;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  usuario: Usuario;
  items: DetallePedido[];
  total: number;
  estado: EstadoPedido;
  metodoPago: MetodoPago;
  direccionEnvio: DireccionEnvio;
  notas?: string;
  fechaCreacion: string;
  fechaActualizacion?: string;
}

export interface CrearPedidoRequest {
  direccionEnvio: DireccionEnvio;
  metodoPago: MetodoPago;
  notas?: string;
}
