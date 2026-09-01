import { BookOpen } from 'lucide-react';
import { useExerciseCatalog } from '../../lib/gateway/hooks/useExercises';
import { ExerciseCard } from '../../components/exercise/ExerciseCard';

/** Página huérfana: catálogo de solo lectura vía gateway */
export const LibraryMisEjerciciosPage = () => {
  const { data: ejercicios = [], isLoading } = useExerciseCatalog();

  return (
    <div>
      <section className="animate-slide-up" style={{ paddingBottom: 14 }}>
        <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
          <BookOpen size={10} style={{ marginRight: 3 }} />
          Catálogo
        </span>
        <h1 className="font-sora text-2xl font-bold mt-2">Ejercicios (Supabase)</h1>
        <p className="text-sm text-secondary mt-1">
          El catálogo es de solo lectura y proviene del gateway. Usa `/library/catalogo/ejercicios` para la vista completa.
        </p>
      </section>

      {isLoading ? (
        <p className="text-sm text-muted">Cargando…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ejercicios.slice(0, 12).map((ej) => (
            <ExerciseCard
              key={ej.id}
              item={{
                exerciseId: String(ej.id),
                name: ej.nombre,
                imageUrl: ej.imagen ?? '',
                keywords: [],
                bodyParts: ej.grupo_muscular,
                equipments: ej.equipamiento,
                targetMuscles: ej.musculos_anatomia ?? [],
                secondaryMuscles: [],
                exerciseType: ej.categoria,
              }}
              onClick={() => undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};
