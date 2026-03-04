export type TipoMetodoPago = 'YAPE' | 'PLIN' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'TRANSFERENCIA';

export interface MetodoPagoGuardado {
  id?: number;
  tipo: TipoMetodoPago;
  alias: string;             // "Mi Yape", "Visa terminada en 4242"
  detalle: string;           // número enmascarado o banco
  esPrincipal: boolean;
  fechaCreacion?: string;
}

export interface CrearMetodoPagoDTO {
  tipo: TipoMetodoPago;
  alias: string;
  detalle: string;
  esPrincipal?: boolean;
}