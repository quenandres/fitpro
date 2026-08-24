-- FitPro Database Schema
-- Ejecutado automáticamente al crear el contenedor PostgreSQL
-- Compatible con migración futura a Supabase (mismo Postgres 16)

-- Extensiones necesarias para Supabase (UUID, crypto)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de ejercicios
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    body_part VARCHAR(50) NOT NULL,
    equipment VARCHAR(100) NOT NULL,
    muscle_group VARCHAR(100) NOT NULL,
    secondary_muscles JSONB DEFAULT '[]',
    target VARCHAR(100) NOT NULL,
    
    -- Instrucciones (texto completo por idioma)
    instructions_en TEXT,
    instructions_es TEXT,
    instructions_it TEXT,
    instructions_tr TEXT,
    instructions_ru TEXT,
    instructions_zh TEXT,
    instructions_hi TEXT,
    instructions_pl TEXT,
    instructions_ko TEXT,
    instructions_fr TEXT,
    
    -- Pasos (arrays JSON por idioma)
    instruction_steps_en JSONB DEFAULT '[]',
    instruction_steps_es JSONB DEFAULT '[]',
    instruction_steps_it JSONB DEFAULT '[]',
    instruction_steps_tr JSONB DEFAULT '[]',
    instruction_steps_ru JSONB DEFAULT '[]',
    instruction_steps_zh JSONB DEFAULT '[]',
    instruction_steps_hi JSONB DEFAULT '[]',
    instruction_steps_pl JSONB DEFAULT '[]',
    instruction_steps_ko JSONB DEFAULT '[]',
    instruction_steps_fr JSONB DEFAULT '[]',
    
    -- Media
    image VARCHAR(200),
    gif_url VARCHAR(200),
    media_id VARCHAR(50),
    attribution TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para queries comunes
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_body_part ON exercises(body_part);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_target ON exercises(target);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_external_id ON exercises(external_id);

-- Full-text search en español (para búsqueda de texto)
CREATE INDEX IF NOT EXISTS idx_exercises_name_es ON exercises USING gin(to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_exercises_instructions_es ON exercises USING gin(to_tsvector('simple', COALESCE(instructions_es, '')));

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
