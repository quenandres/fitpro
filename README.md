# FitPro - App de Entrenamiento

Aplicación React + TypeScript + Vite para gestionar rutinas y ejercicios de entrenamiento.

## Modelos de Datos

### Ejercicio (`src/types/index.ts:18-32`)

```typescript
interface Ejercicio {
  id: number;
  nombre: string;
  categoria: string;           // "Fuerza", "Cardio", "Funcional", etc.
  grupo_muscular: string[];     // Músculos trabajados
  equipamiento: string[];       // Equipamiento necesario
  dificultad: string;           // "Principiante", "Intermedio", "Avanzado"
  unidad_id_default: number;    // Referencia a Unidad por defecto
  descripcion: string;
  tags: string[];               // Etiquetas para búsqueda
  imagen?: string;
  videos?: string[];
  recomendaciones?: string[];
  descripcion_larga?: string;
}
```

**Archivo de datos:** `src/data/ejercicios.json`

**Categorías de ejemplo:**
- Fuerza: Sentadilla con Barra, Press de Banca, Peso Muerto
- Cardio: Carrera, Remo, SkiErg
- Funcional: Empuje de Trineo, Wall Balls, Farmer Carry
- Metabólico: Burpees, Mountain Climbers

---

### EjercicioRutina (`src/types/index.ts:1-6`)

Representa un ejercicio dentro de una rutina con sus parámetros específicos:

```typescript
interface EjercicioRutina {
  nombre: string;      // Nombre del ejercicio (referencia a Ejercicio)
  series: number;      // Número de series
  valor: number;      // Cantidad según unidad (reps, metros, segundos)
  unidad_id: number;   // Referencia a Unidad
}
```

---

### Rutina (`src/types/index.ts:8-16`)

```typescript
interface Rutina {
  id: number;
  nombre: string;
  categoria: string;       // "Fuerza", "Cardio", "Funcional", etc.
  dificultad: string;      // "Principiante", "Intermedio", "Avanzado"
  duracion_min: number;    // Duración estimada en minutos
  descripcion: string;
  ejercicios: EjercicioRutina[];
}
```

**Archivo de datos:** `src/data/rutinas.json`

**Rutinas predefinidas:**
1. Simulacro Hyrox - Competición funcional (60 min)
2. Fuerza Total (Full Body) - Hipertrofia general (45 min)
3. HIIT Quema Grasa - Intervalos de alta intensidad (20 min)
4. Core de Acero - Enfoque en abdomen (15 min)
5. Piernas y Glúteos - Tren inferior (50 min)
6. Push/Pull - División torso (55 min)
7. Calistenia en Casa - Peso corporal (30 min)
8. Movilidad y Recuperación - Estiramientos (25 min)
9. WOD CrossFit - AMRAP (15 min)
10. Cardio Steady State - Aeróbico (40 min)

---

### Unidad (`src/types/index.ts:34-40`)

Define los tipos de medida para cuantificar el ejercicio:

```typescript
interface Unidad {
  id: number;
  nombre: string;      // "Repeticiones", "Metros", "Segundos"
  tipo: string;        // "conteo", "distancia", "tiempo", "peso", "energia", "intensidad"
  simbolo: string;     // "reps", "m", "seg", "kg"
  descripcion: string;
}
```

**Archivo de datos:** `src/data/unidades.json`

**Tipos de unidades:**

| Tipo | Unidades |
|------|----------|
| conteo | Repeticiones, Series, Rondas, Pasos |
| distancia | Metros, Kilómetros, Millas |
| tiempo | Minutos, Segundos |
| peso | Kilogramos, Libras |
| energia | Calorías |
| intensidad | Porcentaje, Frecuencia Cardíaca, Fallo |

---

## Docker

### Requisitos Previos
- Docker instalado
- Docker Compose instalado

### Comandos

```bash
# Iniciar la aplicación
docker-compose up --build

# Iniciar en segundo plano
docker-compose up -d --build

# Detener la aplicación
docker-compose down

# Ver logs
docker-compose logs -f

# Reiniciar
docker-compose restart
```

La aplicación estará disponible en http://localhost:5173

### Desarrollo con Docker

Los cambios en el código se reflejan automáticamente gracias al volumen montado.

---

## Instalación Manual

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev

# Build para producción
npm run build

# Lint
npm run lint
```

---

## Estructura del Proyecto

```
src/
├── components/
│   ├── admin/          # Componentes de administración
│   ├── common/         # Componentes reutilizables
│   ├── dashboard/      # Cards del dashboard
│   └── layout/         # Navbar, ThemeToggle
├── data/               # JSON con ejercicios, rutinas, unidades
├── hooks/              # Custom hooks
├── pages/              # Páginas principales
├── store/              # Estado global con Zustand
├── types/              # TypeScript interfaces
└── utils/              # Utilidades y validadores
```
