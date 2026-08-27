import { ROUTES } from '../../routes/paths';

/** Shared max-width classes for AppShell and Navbar inner containers. */
export type ShellWidth = 'narrow' | 'default' | 'wide';

export const SHELL_WIDTH_CLASS: Record<ShellWidth, string> = {
  narrow: 'max-w-md',
  default: 'max-w-md md:max-w-3xl lg:max-w-5xl',
  wide: 'max-w-md md:max-w-4xl lg:max-w-7xl',
};

export const SHELL_MAIN_PADDING_X = 'px-4 md:px-6 lg:px-8';
export const SHELL_MAIN_PADDING_TOP = 'pt-[70px]';
export const SHELL_MAIN_PADDING_BOTTOM = 'pb-24 md:pb-10';
export const SHELL_MAIN_PADDING_BOTTOM_COMPACT = 'pb-6 md:pb-8';

/** @deprecated use granular constants above */
export const SHELL_MAIN_PADDING =
  `${SHELL_MAIN_PADDING_X} ${SHELL_MAIN_PADDING_TOP} ${SHELL_MAIN_PADDING_BOTTOM}`;

/** Route-aware shell width — used by LibraryLayout and any page-level shell. */
export function resolveShellWidth(pathname: string): ShellWidth {
  const { library: lib } = ROUTES;

  if (pathname.startsWith(lib.planes)) return 'wide';
  if (pathname.startsWith(ROUTES.calendar)) return 'wide';
  if (pathname.includes('/rutinas/nueva') || pathname.endsWith('/ia')) return 'narrow';

  return 'default';
}

/** True for any route under `/library`. */
export function isLibraryRoute(pathname: string): boolean {
  return pathname === ROUTES.library.root || pathname.startsWith(`${ROUTES.library.root}/`);
}
