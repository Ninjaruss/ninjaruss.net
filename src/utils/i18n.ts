/** One `hreflang` alternate: the language and the site-relative path. */
export interface Alternate {
  hreflang: string;
  path: string;
}

/* The only translated pair on the site: the English homepage and the Japanese
   introduction at /ja. Deliberately a literal rather than a convention —
   there is no /ja/** mirror and no locale routing to derive this from, and
   inventing one would imply a translated site that does not exist. */
const PAIR: Alternate[] = [
  { hreflang: 'en', path: '/' },
  { hreflang: 'ja', path: '/ja/' },
];

/* An hreflang URL that is not the page's own canonical URL gets discarded,
   so these paths carry the trailing slash the static build uses for
   `canonical` and the sitemap. Matching, below, is slash-insensitive;
   only the emitted form is pinned. */
const normalize = (pathname: string): string =>
  pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;

const PAIRED_PATHS = new Set(PAIR.map(({ path }) => normalize(path)));

/**
 * The `hreflang` alternates for a page, or an empty array when the page has
 * no translated counterpart. Tolerates the trailing slash Astro's static
 * build emits (`/ja/`) so the built page and the dev route agree.
 */
export function translatedAlternates(pathname: string): Alternate[] {
  return PAIRED_PATHS.has(normalize(pathname)) ? PAIR : [];
}
