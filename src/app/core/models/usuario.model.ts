export interface Rol {
  id: number;
  nombre: string;             // 'ROLE_ADMIN', 'ROLE_USER', etc.
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  password?: string;          // Nunca mostrar en UI, solo para requests
  nombreCompleto?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  distrito?: string;
  codigoPostal?: string;
  notas?: string;
  activo: boolean;
  roles: Rol[];
  fechaCreacion?: string;
  fechaActualizacion?: string;
  ultimoAcceso?: string;
}

// Para login
export interface LoginRequest {
  username: string;
  password: string;
}

// Para registro
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nombreCompleto?: string;
  telefono?: string;
}

// Respuesta de autenticación (cuando implementen JWT)
export interface AuthResponse {
  token: string;
  tipo: string;               // 'Bearer'
  usuario: Usuario;
}
