import { useGatewayBodyParts } from '../../lib/gateway/exercise-catalog-hooks';
import { ReferenceCatalogPage } from './ReferenceCatalogPage';

export const BodyPartsCatalogPage = () => {
  const { data = [], isLoading, isError, error, refetch } = useGatewayBodyParts();

  return (
    <ReferenceCatalogPage
      title="Partes del cuerpo"
      subtitle="Al elegir una parte se abren los ejercicios filtrados."
      badge="Partes del cuerpo"
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
