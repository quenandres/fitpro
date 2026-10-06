import { useGatewayMuscleGroups } from '../../lib/gateway/exercise-catalog-hooks';
import { ReferenceCatalogPage } from './ReferenceCatalogPage';

export const ExerciseTypesCatalogPage = () => {
  const { data = [], isLoading, isError, error, refetch } = useGatewayMuscleGroups();

  return (
    <ReferenceCatalogPage
      title="Grupos musculares"
      subtitle="Filtra ejercicios por grupo muscular del catálogo."
      badge="Grupos musculares"
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
