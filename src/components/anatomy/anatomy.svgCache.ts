type RawLoader = () => Promise<string>;

function basename(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1);
}

/**
 * Glob lazy de los SVGs de músculos (todos excepto siluetas) como texto.
 * Vite los bundea como módulos `?raw`: se cargan sin red ni CORS y se inyectan
 * inline. Las siluetas se excluyen porque se pintan como `<img>` (ver URLs
 * más abajo).
 */
const localLoaders = import.meta.glob<string>(
  [
    '../../../data/anatomy_svgs/*.svg',
    '!../../../data/anatomy_svgs/silhouette_*.svg',
  ],
  { query: '?raw', import: 'default' },
) as Record<string, RawLoader>;

const byFileName: Record<string, RawLoader> = Object.fromEntries(
  Object.entries(localLoaders).map(([path, loader]) => [basename(path), loader]),
);

/**
 * Glob eager con URLs resueltas a los mismos SVGs. Se usa para elementos que
 * se pintan como `<img src>` (siluetas), manteniéndolos locales sin tener que
 * fetchearlos como texto.
 */
const localUrls = import.meta.glob<string>(
  '../../../data/anatomy_svgs/*.svg',
  { query: '?url', import: 'default', eager: true },
) as Record<string, string>;

const urlByFileName: Record<string, string> = Object.fromEntries(
  Object.entries(localUrls).map(([path, url]) => [basename(path), url]),
);

/** URL local (bundled por Vite) de un SVG, o `undefined` si no está presente. */
export function getLocalSvgUrl(fileName: string): string | undefined {
  return urlByFileName[fileName];
}

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

/**
 * Devuelve el markup de un SVG dado su nombre de archivo (ej. `Abs_male.svg`).
 * Usa caché en memoria y deduplica cargas concurrentes. Rechaza si el archivo
 * no existe en `data/anatomy_svgs/`.
 */
export function loadSvgMarkup(fileName: string): Promise<string> {
  const cached = cache.get(fileName);
  if (cached !== undefined) return Promise.resolve(cached);

  const pending = inflight.get(fileName);
  if (pending) return pending;

  const loader = byFileName[fileName];
  if (!loader) {
    return Promise.reject(
      new Error(`SVG no encontrado en data/anatomy_svgs/: ${fileName}`),
    );
  }

  const promise = loader()
    .then((text) => {
      cache.set(fileName, text);
      inflight.delete(fileName);
      return text;
    })
    .catch((err) => {
      inflight.delete(fileName);
      throw err;
    });

  inflight.set(fileName, promise);
  return promise;
}

/** Acceso síncrono al caché (para inicializar state sin parpadeos). */
export function getCachedSvgMarkup(fileName: string): string | undefined {
  return cache.get(fileName);
}

/**
 * Normaliza el `<svg>` raíz: quita `width`/`height`/`style` del propio `<svg>`
 * para que escale al contenedor, y fuerza `preserveAspectRatio` consistente.
 */
export function normalizeSvgMarkup(markup: string): string {
  return markup.replace(/<svg\b([^>]*)>/i, (_, attrs: string) => {
    const cleaned = attrs
      .replace(/\s(width|height|style)="[^"]*"/gi, '')
      .replace(/\spreserveAspectRatio="[^"]*"/gi, '');
    return `<svg${cleaned} preserveAspectRatio="xMidYMid meet">`;
  });
}
