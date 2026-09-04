import { useExerciseTypes } from '../../lib/exercisedb';
import { ReferenceCatalogPage } from './ReferenceCatalogPage';

export const ExerciseTypesCatalogPage = () => {
  const { data = [], isLoading, isError, error, refetch } = useExerciseTypes();

  return (
    <ReferenceCatalogPage
      title="Tipos de ejercicio"
      subtitle="Fuerza, cardio, yoga y más modalidades."
      badge="Tipos de ejercicio"
      accent="#f59e0b"
      accentBg="rgba(245,158,11,.12)"
      filterKey="exerciseType"
      items={data}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={() => void refetch()}
    />
  );
};
