import { z } from 'zod';

export const gatewayHistorialSerieSchema = z.object({
  id: z.string(),
  ejercicio_id: z.string(),
  numero_serie: z.number(),
  peso_kg: z.number(),
  repeticiones: z.number(),
  confirmada: z.boolean().optional(),
  nombre: z.string().optional(),
});

export const gatewayHistorialRowSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  fecha: z.string(),
  volumen_kg: z.number(),
  ejercicios_count: z.number(),
  series: z.array(gatewayHistorialSerieSchema),
});

export type GatewayHistorialRow = z.infer<typeof gatewayHistorialRowSchema>;
