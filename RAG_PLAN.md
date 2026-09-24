# RAG_PLAN — Conocimiento vectorial para IA de rutinas

> **Estado: fuera de alcance (2026-09-23).** No se implementará RAG ni
> `pgvector` / `exercise_knowledge` para enriquecer `/library/ia`. El chat de
> rutinas sigue usando el flujo actual de `gym-gateway` (`POST /api/ai/routine`,
> OpenRouter) sin retrieval sobre un corpus propio.
>
> El borrador siguiente se conserva solo como archivo histórico de una conversación
> de diseño (2026-08-18); no es un plan activo.

---

## Borrador archivado (no implementar)

### Objetivo que se descartó

Construir un RAG de conocimiento de ejercicios/fitness para inyectar contexto
en el chat IA de generación de rutinas en
[AIRoutineChatPage.tsx](src/pages/library/AIRoutineChatPage.tsx).

### Piezas que no se construirán

- Esquema `exercise_knowledge` + `pgvector` en Supabase
- Scripts de ingesta / normalización / embeddings
- Módulo `knowledge_retrieval` en backend
- Integración retrieval → prompt de `/api/ai/routine`

Para retomar esta idea en el futuro haría falta una decisión de producto nueva
y una ADR en `CONTEXT.md §13`.

---

<details>
<summary>Texto original del borrador (2026-08-18)</summary>

Ver historial de git del archivo `RAG_PLAN.md` antes del 2026-09-23 para el
documento completo (decisiones, SQL de ejemplo, checklist §6).

</details>
