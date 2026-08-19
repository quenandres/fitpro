# RAG_PLAN — Plan de RAG de conocimiento de ejercicios (borrador para retomar)

> Documento de diseño, aún sin implementar. Objetivo: no perder el contexto
> de la conversación en que se definió, para retomarlo cuando se resuelva
> el checklist de la sección 6.
>
> Fecha de creación: 2026-08-18.

---

## 1. Objetivo y alcance

Construir un RAG (retrieval-augmented generation) de conocimiento de
ejercicios/fitness para enriquecer el chat IA de generación de rutinas en
`/library/ia` ([AIRoutineChatPage.tsx](src/pages/library/AIRoutineChatPage.tsx),
backend `fitpro_api` + DeepSeek).

**Alcance explícitamente acotado:** esto abre la Fase 3 del roadmap
(`CONTEXT.md §7`, hoy en 0%) **solo** para una tabla nueva de conocimiento
vectorial en Supabase. **No** implica:
- Migrar Auth real / roles (sigue siendo mock, ver `CLAUDE.md §5.1-5.2`).
- Migrar el dominio `rutinas`/`ejercicios`/`unidades` de `useDataStore` a
  Supabase.
- Adelantar la Fase 2.5 (rediseño del modelo `Rutina/Bloque/...`), que sigue
  siendo bloqueante y separada de este trabajo.

## 2. Decisiones ya tomadas

| Decisión | Valor | Motivo |
|---|---|---|
| Dataset | CSV/JSON propio de ejercicios (miles de filas) | Ya lo tiene el usuario |
| Vector store | `pgvector` en Supabase | Coherente con D1/D3/D5 de `CONTEXT.md`: un solo backend Postgres+RLS, sin infra nueva |
| Proveedor de embeddings | **Pendiente** — OpenAI `text-embedding-3-small` vs. modelo local (`bge`/`e5`) | DeepSeek (ya usado para el chat) no expone API de embeddings pública |
| Dimensión del vector | **Pendiente**, depende del proveedor elegido | 1536 (OpenAI) vs. 384/768 (modelos locales) — cambiarla después implica re-vectorizar todo |

## 3. Piezas a implementar

| Pieza | Tipo | Ubicación propuesta | Cuándo corre |
|---|---|---|---|
| Esquema SQL | DDL manual, una vez por entorno | `scripts/rag_schema.sql` | Manual, vía Supabase SQL editor |
| Script de ingesta | Job manual, re-ejecutable | `fitpro_api/scripts/ingest_knowledge.py` | Cada vez que se actualiza el dataset |
| Modo `--dry-run` / preview | Job manual, sin costo | mismo script o `preview_normalization.py` | Antes de la primera ingesta real |
| Módulo de retrieval | Código de servicio (no script) | `fitpro_api/app/services/knowledge_retrieval.py` | En cada request de `/api/ai/routine` |

### 3.1 `scripts/rag_schema.sql`
DDL: habilita extensión `vector`, crea tabla `exercise_knowledge`, índice
`hnsw`, policies RLS (lectura pública, escritura solo `service_role`).
Sigue el mismo patrón que el ya existente [scripts/init.sql](scripts/init.sql)
(tabla `exercises` de `fitpro_api`).

```sql
create extension if not exists vector;

create table if not exists exercise_knowledge (
  id uuid primary key default gen_random_uuid(),
  ejercicio_id integer references exercises(id), -- opcional, si aplica
  content text not null,
  content_hash text not null,
  metadata jsonb not null default '{}',
  embedding vector(1536), -- ajustar según proveedor elegido (§2)
  created_at timestamptz default now()
);

create index if not exists exercise_knowledge_embedding_idx
  on exercise_knowledge using hnsw (embedding vector_cosine_ops);

alter table exercise_knowledge enable row level security;

create policy "lectura pública" on exercise_knowledge
  for select using (true);
-- sin policy de insert/update para anon: solo se escribe con service_role
```

### 3.2 `fitpro_api/scripts/ingest_knowledge.py`
Orden de pasos:
1. Lee el CSV/JSON del dataset.
2. Normaliza cada fila a un esquema único → arma un solo campo `content`
   (texto legible, no JSON crudo).
3. Chunkea si algún `content` es muy largo (~300-500 tokens por chunk).
4. Calcula un hash (`content_hash`) por fila.
5. Compara contra lo que ya existe en `exercise_knowledge` por hash — si no
   cambió, **no la vuelve a embeber** (idempotencia, evita costo repetido).
6. Embebe en batches las filas nuevas/cambiadas.
7. Hace `upsert` a Supabase con la `service_role` key.

### 3.3 Modo `--dry-run` / `preview_normalization.py`
Corre los pasos 1-4 del script de ingesta e imprime una muestra en consola,
**sin** llamar al proveedor de embeddings ni tocar Supabase. Sirve para
detectar basura en la normalización (nombres vacíos, HTML sin limpiar,
encoding roto) antes de pagar por embeddings.

### 3.4 `fitpro_api/app/services/knowledge_retrieval.py`
Dado un texto de consulta del usuario: lo embebe, hace
`SELECT ... ORDER BY embedding <=> $1 LIMIT k` contra `exercise_knowledge`
(top-K, 3-5), y arma el bloque de contexto para inyectar en el prompt de
DeepSeek. Se integra en el flujo actual de
[deepseek.ts](src/lib/ai/deepseek.ts) / `useAiRoutineChat.ts` pasando siempre
por el backend — nunca embeber ni consultar Supabase desde el frontend.

## 4. Consideraciones y restricciones específicas de este repo

- **Ninguna key con permisos de escritura va al frontend.** `service_role`
  de Supabase y la key del proveedor de embeddings viven solo en
  `fitpro_api/.env`, mismo patrón que `DEEPSEEK_API_KEY`. No repetir el
  precedente de `VITE_RAPIDAPI_KEY` expuesta client-side.
- **No usar `exercise_knowledge` como fuente de verdad del dominio.** Es
  conocimiento de apoyo para retrieval; no reemplaza ni adelanta la
  Fase 2.5 (`Rutina → Bloque[] → BloqueItem[] → SerieDef[]`).
- **Idempotencia obligatoria** en la ingesta (hash de `content`) para poder
  re-correr el script sin re-pagar embeddings de filas sin cambios.
- **RLS desde el día 1** (D5 de `CONTEXT.md`): aunque el contenido sea
  público, la policy de solo-lectura debe existir explícitamente, no
  depender de que la tabla "por defecto" sea privada.

## 5. Esquema de contenido (ejemplo de normalización)

```
content = f"{nombre}. Grupo muscular: {grupo_muscular}. "
          f"Equipo: {equipamiento}. Instrucciones: {instrucciones}. "
          f"Contraindicaciones: {contraindicaciones or 'ninguna reportada'}."
```
(Ajustar una vez se conozcan las columnas reales del dataset — ver
checklist §6.)

## 6. Checklist para retomar

- [ ] Compartir muestra real de columnas del dataset (nombres exactos,
      ejemplos de valores, tamaño de los campos de texto largo).
- [ ] Elegir proveedor de embeddings y fijar la dimensión del vector.
- [ ] Confirmar si `ejercicio_id` del dataset mapea a IDs existentes en
      `src/data/ejercicios.json` o en la futura tabla `exercises` del
      backend, o si va sin FK por ahora.
- [ ] Decidir si el script de ingesta vive en `fitpro_api/scripts/` (Python,
      recomendado por consistencia con el backend) o en `scripts/` del
      frontend (Node, como `download-anatomy-svgs.mjs`) si se prefiere
      evitar dependencias nuevas en Python.
- [ ] Una vez implementado: documentar la decisión final en
      `CONTEXT.md §13` (bitácora ADR) — proveedor de embeddings elegido,
      dimensión, y por qué pgvector vs. vector DB dedicada.

## 7. Nota de trazabilidad

Este documento resume una conversación de diseño previa (sin código
implementado). Para el detalle completo de la discusión, opciones
descartadas y justificación de cada decisión, consultar el historial de
esa conversación.
