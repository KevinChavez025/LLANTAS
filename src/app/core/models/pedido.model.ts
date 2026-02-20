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
  nombreInvitado?: string;     // alias de nombreCliente en el backend
  emailInvitado?: string;      // alias de emailCliente en el backend
  telefonoInvitado?: string;   // alias de telefonoCliente en el backend

  // El backend devuelve detalles (no items)
  items?: DetallePedido[];
  detalles?: DetallePedido[];  // campo real del backend (PedidoResponse)

  // Totales
  subtotal?: number;
  igv?: number;
  costoEnvio?: number;
  total: number;

  // Estado
  estado: EstadoPedido;
  estadoPago: EstadoPago;
  metodoPago?: MetodoPago;
  fechaPago?: string;

  // Dirección de envío
  direccionEnvio: string;
  ciudadEnvio?: string;        // usado en HTMLs
  departamentoEnvio?: string;
  distritoEnvio?: string;
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
// Campos alineados con CrearPedidoRequest.java del backend

export interface CrearPedidoRequest {
  // Clave idempotente (anti doble-submit)
  idempotencyKey?: string;

  // Para usuarios registrados
  usuarioId?: number;

  // Para usuarios invitados
  sessionId?: string;

  // Datos del cliente invitado (backend usa nombreCliente, emailCliente, telefonoCliente)
  nombreCliente?: string;
  emailCliente?: string;
  telefonoCliente?: string;

  // Dirección de envío (backend usa ciudad, distrito, departamento — sin sufijo "Envio")
  direccionEnvio: string;
  ciudad?: string;
  distrito?: string;
  departamento?: string;
  codigoPostal?: string;
  telefonoContacto?: string;

  // Pago
  metodoPago: MetodoPago;

  // Notas
  notasAdicionales?: string;
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
// Los campos de PedidoResponse del backend ya están cubiertos en la interfaz Pedido arriba.
