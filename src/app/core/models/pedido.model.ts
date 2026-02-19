// ============================================================
// PEDIDO MODEL — sincronizado con tablas `pedidos` y `detalle_pedidos`
// ============================================================

import { Usuario } from './usuario.model';
import { Producto } from './producto.model';

// ——— Enums (deben coincidir exactamente con los ENUMs de PostgreSQL) ———

export type EstadoPedido =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'EN_PREPARACION'
  | 'ENVIADO'
  | 'ENTREGADO'
  | 'CANCELADO';

export type EstadoPago =
  | 'PENDIENTE'
  | 'PAGADO'
  | 'FALLIDO'
  | 'REEMBOLSADO';

export type MetodoPago =
  | 'EFECTIVO'
  | 'TARJETA_CREDITO'
  | 'TARJETA_DEBITO'
  | 'TRANSFERENCIA'
  | 'YAPE'
  | 'PLIN';

// ——— Detalle del pedido (tabla `detalle_pedidos`) ———

export interface DetallePedido {
  id: number;
  pedidoId: number;
  // producto puede ser null si fue eliminado (ON DELETE SET NULL)
  producto?: Producto;
  // Snapshot del producto al momento de la compra (nunca cambian)
  nombreProducto: string;
  marcaProducto?: string;
  medidaProducto?: string;
  cantidad: number;            // CHECK BETWEEN 1 AND 999
  precioUnitario: number;      // NUMERIC(10,2)
  subtotal: number;            // NUMERIC(10,2)
}

// ——— Pedido principal (tabla `pedidos`) ———

export interface Pedido {
  id: number;
  numeroPedido: string;        // UNIQUE — generado por el backend (ej: "PED-20250001")

  // Cliente: registrado o invitado (la BD exige uno de los dos)
  usuario?: Pick<Usuario, 'id' | 'username' | 'email' | 'nombreCompleto'>;
  nombreInvitado?: string;
  emailInvitado?: string;
  telefonoInvitado?: string;

  items: DetallePedido[];

  // Totales
  subtotal?: number;           // Sin IGV ni envío
  igv?: number;                // 18% en Perú
  costoEnvio?: number;
  total: number;               // CHECK > 0

  // Estado
  estado: EstadoPedido;
  estadoPago: EstadoPago;
  metodoPago?: MetodoPago;
  fechaPago?: string;

  // Dirección de envío (campos planos, no objeto separado)
  direccionEnvio: string;
  ciudadEnvio?: string;
  departamentoEnvio?: string;
  codigoPostalEnvio?: string;
  telefonoContacto?: string;

  notas?: string;

  // Fechas
  fechaPedido?: string;
  fechaCreacion: string;
  fechaActualizacion?: string;
  fechaEntregaEstimada?: string;
  fechaEntregaReal?: string;
}

// ——— Request para crear pedido (desde checkout) ———

export interface CrearPedidoRequest {
  // Dirección de envío
  direccionEnvio: string;
  ciudadEnvio?: string;
  departamentoEnvio?: string;
  codigoPostalEnvio?: string;
  telefonoContacto?: string;

  metodoPago: MetodoPago;
  notas?: string;

  // Solo si es invitado (sin cuenta)
  nombreInvitado?: string;
  emailInvitado?: string;
  telefonoInvitado?: string;
}

// ——— Request para cambiar estado (admin) ———

export interface CambiarEstadoRequest {
  estado: EstadoPedido;
}

// ——— Helpers de UI ———

// Etiquetas legibles para mostrar en pantalla
export const ESTADO_PEDIDO_LABEL: Record<EstadoPedido, string> = {
  PENDIENTE:       'Pendiente',
  CONFIRMADO:      'Confirmado',
  EN_PREPARACION:  'En preparación',
  ENVIADO:         'Enviado',
  ENTREGADO:       'Entregado',
  CANCELADO:       'Cancelado'
};

export const ESTADO_PAGO_LABEL: Record<EstadoPago, string> = {
  PENDIENTE:    'Pendiente',
  PAGADO:       'Pagado',
  FALLIDO:      'Fallido',
  REEMBOLSADO:  'Reembolsado'
};

export const METODO_PAGO_LABEL: Record<MetodoPago, string> = {
  EFECTIVO:        'Efectivo',
  TARJETA_CREDITO: 'Tarjeta de crédito',
  TARJETA_DEBITO:  'Tarjeta de débito',
  TRANSFERENCIA:   'Transferencia bancaria',
  YAPE:            'Yape',
  PLIN:            'Plin'
};