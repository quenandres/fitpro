import { Sheet } from '../common/Sheet';
import { CalendarSidebarBody, type CalendarSidebarBodyProps } from './CalendarSidebarBody';

interface CalendarFiltersSheetProps extends CalendarSidebarBodyProps {
  open: boolean;
  onClose: () => void;
}

export function CalendarFiltersSheet({
  open,
  onClose,
  ...sidebarProps
}: CalendarFiltersSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Filtros del calendario" flexColumn>
      <div className="fp-cal-filters-sheet">
        <h2 className="font-sora fp-cal-filters-title">Filtros</h2>
        <div className="fp-cal-sidebar-inner">
          <CalendarSidebarBody {...sidebarProps} />
        </div>
      </div>
    </Sheet>
  );
}
