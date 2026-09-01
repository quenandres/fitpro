export const gatewayKeys = {
  all: ['gateway'] as const,
  authContext: () => [...gatewayKeys.all, 'auth-context'] as const,
  exercises: {
    all: () => [...gatewayKeys.all, 'exercises'] as const,
    list: (params: Record<string, unknown>) =>
      [...gatewayKeys.exercises.all(), 'list', params] as const,
    detail: (id: number) => [...gatewayKeys.exercises.all(), 'detail', id] as const,
    bodyParts: () => [...gatewayKeys.exercises.all(), 'body-parts'] as const,
    equipments: () => [...gatewayKeys.exercises.all(), 'equipments'] as const,
    muscles: () => [...gatewayKeys.exercises.all(), 'muscles'] as const,
  },
  templates: {
    all: () => [...gatewayKeys.all, 'templates'] as const,
    list: () => [...gatewayKeys.templates.all(), 'list'] as const,
    detail: (id: string) => [...gatewayKeys.templates.all(), 'detail', id] as const,
  },
  units: () => [...gatewayKeys.all, 'units'] as const,
};

export const GATEWAY_STALE_TIME = 1000 * 60 * 5;
