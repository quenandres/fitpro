import { ROUTES } from '../routes/paths';

export type BillingBackTarget = {
  to: string;
  label: string;
};

export function getSuscripcionesBack(): BillingBackTarget {
  return {
    to: ROUTES.library.suscripciones,
    label: 'Volver a suscripciones',
  };
}

export function getSuscripcionBack(): BillingBackTarget {
  return getSuscripcionesBack();
}

export function getPagosBack(): BillingBackTarget {
  return {
    to: ROUTES.library.pagos,
    label: 'Volver a pagos',
  };
}

export function getPagoBack(): BillingBackTarget {
  return getPagosBack();
}
