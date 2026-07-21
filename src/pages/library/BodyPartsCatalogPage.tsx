import { useBodyParts } from '../../lib/exercisedb';
import { ReferenceCatalogPage } from './ReferenceCatalogPage';

export const BodyPartsCatalogPage = () => {
  const { data = [], isLoading, isError, error, refetch } = useBodyParts();

  return (
    <ReferenceCatalogPage
      title="Partes del cuerpo"
      subtitle="Al elegir una parte se abren los ejercicios filtrados."
      badge="Body parts"
      accent="#22c55e"
      accentBg="rgba(34,197,94,.12)"
      filterKey="bodyPart"
      items={data}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={() => void refetch()}
    />
  );
};
