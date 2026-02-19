// ============================================================
// PRODUCTO MODEL — sincronizado con tabla `productos`
// ============================================================

export interface Producto {
  id: number;
  nombre: string;
  marca: string;               // NOT NULL en BD
  modelo?: string;             // Campo nuevo en BD
  tipoVehiculo?: string;       // Moto, Mototaxi, Camión, Auto, etc.
  medida?: string;             // 3.00-18, 205/55R16, etc.
  categoria?: string;          // Delantero, Posterior, Mixta
  precio: number;              // NUMERIC(10,2) — CHECK > 0
  descripcion?: string;
  stock: number;               // NOT NULL DEFAULT 0 — CHECK >= 0
  disponible: boolean;
  esNuevo: boolean;
  esDestacado: boolean;
  urlImagen?: string;
  fechaCreacion?: string;      // ISO string
  fechaActualizacion?: string;
}

// Para crear producto (admin)
export interface CrearProductoDTO {
  nombre: string;
  marca: string;
  modelo?: string;
  tipoVehiculo?: string;
  medida?: string;
  categoria?: string;
  precio: number;
  descripcion?: string;
  stock?: number;
  disponible?: boolean;
  esNuevo?: boolean;
  esDestacado?: boolean;
  urlImagen?: string;
}

// Para actualizar producto (admin) — todos opcionales
export type ActualizarProductoDTO = Partial<CrearProductoDTO>;

// Para filtros en catálogo
export interface ProductoFiltros {
  marca?: string;
  tipoVehiculo?: string;
  categoria?: string;
  precioMin?: number;
  precioMax?: number;
  disponible?: boolean;
  esNuevo?: boolean;
  esDestacado?: boolean;
  textoBusqueda?: string;      // Busca en nombre y descripción
}