import { useGatewayTargetMuscles } from '../../lib/gateway/exercise-catalog-hooks';
import { ReferenceCatalogPage } from './ReferenceCatalogPage';

export const MusclesCatalogPage = () => {
  const { data = [], isLoading, isError, error, refetch } = useGatewayTargetMuscles();

  return (
    <ReferenceCatalogPage
      title="Músculos"
      subtitle="Objetivos musculares del catálogo en Supabase."
      badge="Músculos"
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
