export const getGatewayBaseUrl = (): string => {
  const baseUrl = (import.meta.env.VITE_GATEWAY_URL ?? '').toString().replace(/\/+$/, '');

  if (!baseUrl) {
    throw new Error(
      'VITE_GATEWAY_URL no está configurada. Añádela en .env (ej: http://localhost:8008).',
    );
  }

  return baseUrl;
};
