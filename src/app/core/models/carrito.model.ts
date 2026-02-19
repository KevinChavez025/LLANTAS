// ============================================================
// CARRITO MODEL — sincronizado con tabla `carrito_items`
// La BD no tiene tabla "carrito" como entidad — solo items.
// El frontend agrupa los items en una estructura Carrito.
// ============================================================

import { Producto } from './producto.model';
import { Usuario } from './usuario.model';

export interface CarritoItem {
  id: number;
  sessionId?: string;          // Para usuarios invitados (guest)
  usuario?: Pick<Usuario, 'id' | 'username'>;  // Para usuarios registrados
  producto: Producto;
  cantidad: number;            // CHECK BETWEEN 1 AND 999
  precioUnitario: number;      // NUMERIC(10,2) — precio al momento de agregar
  subtotal: number;            // Calculado: precioUnitario * cantidad
  fechaAgregado?: string;      // ISO string
}

// Estructura calculada en frontend (no existe como tabla en BD)
export interface Carrito {
  items: CarritoItem[];
  cantidadItems: number;
  subtotal: number;
  total: number;
}

// ——— Requests ———

// Agregar producto al carrito
export interface AgregarCarritoRequest {
  productoId: number;
  cantidad: number;            // 1–999
  sessionId?: string;          // Enviar si el usuario es invitado
}

// Actualizar cantidad de un item existente
export interface ActualizarCarritoRequest {
  cantidad: number;            // 1–999
}