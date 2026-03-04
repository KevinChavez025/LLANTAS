// ============================================================
// PRODUCTO MODEL — sincronizado con tabla `productos`
// ============================================================

export interface Producto {
  id: number;
  nombre: string;
  marca: string;               // NOT NULL en BD
  modelo?: string;
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

  // ── Campos de medida separados (pendiente backend) ──────────
  // Cuando el backend los implemente, el catálogo los usará automáticamente
  ancho?: string;              // ej: "205", "3.00"
  perfil?: string;             // ej: "55", "70"
  aro?: string;                // ej: "R16", "17"

  // ── Campos técnicos futuros (pendiente backend) ─────────────
  aroPermitido?: string;       // Aro de llanta permitido
  presentacion?: string;       // ej: "TL" (Tubeless), "TT" (Tube Type)
  rangoVelocidad?: string;     // ej: "H", "V", "W"
  estrellas?: number;          // Calificación 1-5
  servicio?: string;           // ej: "TODO TERRENO", "FUERA DE CARRETERA"
  runFlat?: boolean;           // Tecnología Run Flat
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
  // Campos de medida separados
  ancho?: string;
  perfil?: string;
  aro?: string;
  // Campos técnicos futuros
  aroPermitido?: string;
  presentacion?: string;
  rangoVelocidad?: string;
  estrellas?: number;
  servicio?: string;
  runFlat?: boolean;
}

// Para actualizar producto (admin) — todos opcionales
export type ActualizarProductoDTO = Partial<CrearProductoDTO>;

// Para filtros en catálogo
export interface ProductoFiltros {
  marca?: string;
  modelo?: string;
  tipoVehiculo?: string;
  categoria?: string;
  precioMin?: number;
  precioMax?: number;
  disponible?: boolean;
  esNuevo?: boolean;
  esDestacado?: boolean;
  textoBusqueda?: string;
  // Medida
  ancho?: string;
  perfil?: string;
  aro?: string;
  // Técnicos futuros
  aroPermitido?: string;
  presentacion?: string;
  rangoVelocidad?: string;
  estrellas?: number;
  servicio?: string;
  runFlat?: boolean;
}