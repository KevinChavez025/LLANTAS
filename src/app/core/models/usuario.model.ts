// ============================================================
// USUARIO MODEL — sincronizado con tabla `usuarios` y `roles`
// ============================================================

export interface Rol {
  id: number;
  nombre: 'ADMIN' | 'VENDEDOR' | 'USER';
  descripcion?: string;
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  password?: string;           // Nunca mostrar en UI, solo para requests
  nombreCompleto: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  distrito?: string;
  codigoPostal?: string;
  notas?: string;
  activo: boolean;
  roles: Rol[];
  fechaCreacion?: string;      // ISO string — LocalDateTime en backend
  fechaActualizacion?: string;
  ultimoAcceso?: string;
}

// ——— Auth ———

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nombreCompleto: string;
  telefono?: string;
}

export interface AuthResponse {
  token: string;
  tipo: string;                // 'Bearer'
  usuario: Usuario;
}

// ——— DTOs para admin ———

export interface CrearUsuarioDTO {
  username: string;
  email: string;
  password: string;
  nombreCompleto: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  distrito?: string;
  codigoPostal?: string;
  notas?: string;
  roles: string[];             // ['ADMIN', 'USER', ...]
}

export interface ActualizarUsuarioDTO {
  nombreCompleto?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  distrito?: string;
  codigoPostal?: string;
  notas?: string;
  activo?: boolean;
  roles?: string[];
}