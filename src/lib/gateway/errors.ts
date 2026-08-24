export class GatewayError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GatewayError';
    this.status = status;
  }
}

const extractDetail = (payload: unknown): string | undefined => {
  if (typeof payload !== 'object' || payload === null || !('detail' in payload)) {
    return undefined;
  }

  const detail = (payload as { detail: unknown }).detail;

  if (typeof detail === 'string') return detail;

  if (typeof detail === 'object' && detail !== null) {
    if ('msg' in detail && typeof detail.msg === 'string') return detail.msg;
    if ('error_description' in detail && typeof detail.error_description === 'string') {
      return detail.error_description;
    }
    if ('message' in detail && typeof detail.message === 'string') return detail.message;
    if ('error' in detail && typeof detail.error === 'string') return detail.error;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string };
    if (first?.msg) return first.msg;
  }

  return undefined;
};

export const mapGatewayAuthError = (payload: unknown, status: number): string => {
  const raw = extractDetail(payload)?.toLowerCase() ?? '';
  const asText = typeof payload === 'string' ? payload.toLowerCase() : JSON.stringify(payload).toLowerCase();
  const haystack = `${raw} ${asText}`;

  if (haystack.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos';
  }
  if (haystack.includes('email not confirmed')) {
    return 'Confirma tu correo antes de iniciar sesión';
  }
  if (haystack.includes('user already registered')) {
    return 'Ya existe una cuenta con este correo';
  }
  if (haystack.includes('password')) {
    return 'La contraseña no cumple los requisitos';
  }
  if (status === 422) {
    return extractDetail(payload) ?? 'Revisa los datos del formulario';
  }
  if (status === 401) {
    return 'Sesión inválida o expirada';
  }

  return extractDetail(payload) ?? `No se pudo completar la operación (HTTP ${status})`;
};
