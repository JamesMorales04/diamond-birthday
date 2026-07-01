/**
 * Resolve a public asset path safely under any Vite BASE_URL (GitHub Pages, subpath, etc.).
 * Usage: assetUrl('/photos/cat.svg') → '/base/photos/cat.svg'
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  const cleanPath = path.replace(/^\//, '');
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
}
