import { useIsLargeScreen, useIsMobile } from '../../../hooks/useMediaQuery';

/** Márgenes y tipografía de ejes según viewport — evita el clip del YAxis (`left: -16`) en móvil. */
export function useChartLayout() {
  const isMobile = useIsMobile();
  const isCompact = !useIsLargeScreen();

  return {
    isMobile,
    /** true por debajo de `lg` (1024px): móvil y tablet. */
    isCompact,
    margin: isMobile
      ? { top: 8, right: 4, left: 0, bottom: 4 }
      : { top: 8, right: 8, left: 0, bottom: 4 },
    fontSize: isMobile ? 10 : 11,
    yAxisWidth: isMobile ? 32 : 40,
  } as const;
}

