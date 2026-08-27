import { CalendarSidebarBody, type CalendarSidebarBodyProps } from './CalendarSidebarBody';

export function CalendarSidebar(props: CalendarSidebarBodyProps) {
  return (
    <aside className="fp-cal-sidebar fp-cal-sidebar-desktop">
      <div className="fp-cal-sidebar-inner">
        <CalendarSidebarBody {...props} />
      </div>
    </aside>
  );
}
