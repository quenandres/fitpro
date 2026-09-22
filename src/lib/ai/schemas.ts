import { z } from 'zod';

export const generateRoutineClienteSchema = z.object({
  usuario_id: z.union([z.string(), z.number()]).optional(),
  edad: z.number().int().min(10).max(100).optional(),
  peso_kg: z.number().min(20).max(300).optional(),
  nivel: z.string().optional(),
  objetivo: z.string().optional(),
  dias_entrenar: z.number().int().min(1).max(7).optional(),
  equipamiento: z.string().max(200).optional(),
  limitaciones: z.string().max(300).optional(),
});

export const generateRoutineRequestSchema = z.object({
  objetivo: z.string().min(10).max(500),
  cliente: generateRoutineClienteSchema.optional(),
  nivel: z.string().optional(),
  duracion_min: z.number().int().min(5).max(120).optional(),
  equipamiento: z.string().max(200).optional(),
  limitaciones: z.string().max(300).optional(),
});

const ejercicioRutinaSchema = z.object({
  ejercicio_id: z.number().optional(),
  nombre: z.string(),
  series: z.number(),
  valor: z.number(),
  unidad_id: z.number().optional(),
  exerciseDbId: z.string().optional(),
});

export const generateRoutineApiResponseSchema = z.object({
  rutina: z.object({
    nombre: z.string(),
    categoria: z.string(),
    dificultad: z.string(),
    duracion_min: z.number(),
    descripcion: z.string().optional(),
    ejercicios: z.array(ejercicioRutinaSchema).min(1),
    programacion_semanal: z.array(z.unknown()).optional(),
    semanas: z.number().optional(),
  }),
  dias_entrenamiento: z.array(z.string()),
  razonamiento: z.string().optional(),
});
