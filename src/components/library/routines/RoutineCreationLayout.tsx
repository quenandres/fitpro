import type { ReactNode } from 'react';

interface Props {
  main: ReactNode;
  sidebar: ReactNode;
}

/** Dos columnas en md+; sidebar debajo en móvil. */
export const RoutineCreationLayout = ({ main, sidebar }: Props) => (
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(260px,320px)] gap-6 items-start">
    <div className="min-w-0">{main}</div>
    <aside className="min-w-0 lg:sticky lg:top-[78px]">{sidebar}</aside>
  </div>
);
