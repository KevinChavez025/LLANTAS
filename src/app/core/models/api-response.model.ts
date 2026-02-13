export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: string[];          // Detalles de error si algo falla
  timestamp?: string;
}
