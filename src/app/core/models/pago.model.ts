// ============================================================
// PAGO MODEL — sincronizado con tabla `pagos`
// Tabla nueva en el esquema actualizado
// ============================================================

import { EstadoPago, MetodoPago } from './pedido.model';

export interface Pago {
  id: number;
  pedidoId: number;            // UNIQUE — un pedido tiene un solo pago
  metodoPago: MetodoPago;
  monto: number;               // NUMERIC(10,2) CHECK > 0
  moneda: string;              // 'PEN' por defecto
  estado: EstadoPago;

  // Datos de pasarela de pago (Culqi, MercadoPago, etc.)
  pasarelaPago?: string;
  transactionId?: string;      // UNIQUE
  codigoAutorizacion?: string;
  ultimosDigitosTarjeta?: string;  // Solo 4 dígitos
  tipoTarjeta?: string;            // 'VISA', 'MASTERCARD', etc.

  notas?: string;
  mensajeError?: string;

  fechaCreacion: string;
  fechaProcesado?: string;
}

// Para registrar un pago manual (admin)
export interface RegistrarPagoRequest {
  metodoPago: MetodoPago;
  monto: number;
  moneda?: string;
  transactionId?: string;
  codigoAutorizacion?: string;
  notas?: string;
}