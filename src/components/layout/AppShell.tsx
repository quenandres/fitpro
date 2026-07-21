import type { ReactNode } from 'react';
import { Navbar, BottomNav } from './Navbar';

interface Props {
  children: ReactNode;
  subNav?: ReactNode;
  /** Extra top padding below subnav (default 12) */
  subNavGap?: number;
}

export const AppShell = ({ children, subNav, subNavGap = 12 }: Props) => (
  <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
    <Navbar />
    <BottomNav />

    <main
      className="max-w-md mx-auto"
      style={{
        paddingTop: 70,
        paddingBottom: 80,
        paddingLeft: 16,
        paddingRight: 16,
      }}
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
