import type { ReactNode } from 'react';
import { Navbar, BottomNav } from './Navbar';
import { SHELL_MAIN_PADDING_BOTTOM, SHELL_MAIN_PADDING_BOTTOM_COMPACT, SHELL_MAIN_PADDING_TOP, SHELL_MAIN_PADDING_X, SHELL_WIDTH_CLASS, type ShellWidth } from './shellWidth';

interface Props {
  children: ReactNode;
  subNav?: ReactNode;
  /** Extra top padding below subnav (default 12) */
  subNavGap?: number;
  width?: ShellWidth;
  /** Hide bottom nav (e.g. immersive player). */
  hideBottomNav?: boolean;
}

export const AppShell = ({
  children,
  subNav,
  subNavGap = 12,
  width = 'default',
  hideBottomNav = false,
}: Props) => (
  <div className="min-h-dvh bg-app">
    <Navbar width={width} />
    {!hideBottomNav && <BottomNav />}

    <main
      className={`${SHELL_WIDTH_CLASS[width]} mx-auto ${SHELL_MAIN_PADDING_X} ${SHELL_MAIN_PADDING_TOP} ${hideBottomNav ? SHELL_MAIN_PADDING_BOTTOM_COMPACT : SHELL_MAIN_PADDING_BOTTOM}`}
    >
      {subNav && (
        <div style={{ paddingTop: 12, marginBottom: subNavGap }}>
          {subNav}
        </div>
      )}
      {children}
    </main>
  </div>
);

export type { ShellWidth };
