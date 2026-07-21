import { useMuscles } from '../../lib/exercisedb';
import { ReferenceCatalogPage } from './ReferenceCatalogPage';

export const MusclesCatalogPage = () => {
  const { data = [], isLoading, isError, error, refetch } = useMuscles();

  return (
    <ReferenceCatalogPage
      title="Músculos"
      subtitle="Objetivos musculares del catálogo ExerciseDB."
      badge="Muscles"
      accent="#f472b6"
      accentBg="rgba(244,114,182,.12)"
      filterKey="muscle"
      items={data}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={() => void refetch()}
    />
  );
};
