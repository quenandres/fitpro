import { useEquipments } from '../../lib/exercisedb';
import { ReferenceCatalogPage } from './ReferenceCatalogPage';

export const EquipmentsCatalogPage = () => {
  const { data = [], isLoading, isError, error, refetch } = useEquipments();

  return (
    <ReferenceCatalogPage
      title="Equipamiento"
      subtitle="Filtra por el material que tienes disponible."
      badge="Equipments"
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
