import { Producto } from './producto.model';
import { Usuario } from './usuario.model';

export interface CarritoItem {
  id: number;
  sessionId?: string;         // Para usuarios invitados
  usuario?: Usuario;          // Para usuarios registrados
  producto: Producto;
  cantidad: number;
  precioUnitario: number;     // Precio en el momento de agregar
  fechaAgregado?: string;
}

export interface Carrito {
  items: CarritoItem[];
  subtotal: number;
  total: number;
  cantidadItems: number;
}

// Para agregar producto al carrito
export interface AgregarCarritoRequest {
  productoId: number;
  cantidad: number;
  sessionId?: string;
}

// Para actualizar la cantidad de un item
export interface ActualizarCarritoRequest {
  cantidad: number;
}
