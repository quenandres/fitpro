import { useGatewayEquipments } from '../../lib/gateway/exercise-catalog-hooks';
import { ReferenceCatalogPage } from './ReferenceCatalogPage';

export const EquipmentsCatalogPage = () => {
  const { data = [], isLoading, isError, error, refetch } = useGatewayEquipments();

  return (
    <ReferenceCatalogPage
      title="Equipamiento"
      subtitle="Filtra por el material que tienes disponible."
      badge="Equipamiento"
      accent="#a371f7"
      accentBg="rgba(163,113,247,.12)"
      filterKey="equipment"
      items={data}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={() => void refetch()}
    />
  );
};
