export interface Producto {
  id: number;
  nombre: string;
  marca?: string;
  tipoVehiculo?: string;      // Moto, Mototaxi, Camión, Minería, Auto, etc.
  medida?: string;            // 3.00-18, 205/55R16, etc.
  categoria?: string;         // Delantero, Posterior, Mixta
  precio: number;
  descripcion?: string;
  stock?: number;
  disponible: boolean;
  esNuevo: boolean;
  esDestacado: boolean;
  urlImagen?: string;
  fechaCreacion?: string;     // ISO string (LocalDateTime en backend)
}

// Para crear/actualizar productos desde el admin
export interface CrearProductoDTO {
  nombre: string;
  marca?: string;
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
  textoBusqueda?: string; // nombre o descripción
}
