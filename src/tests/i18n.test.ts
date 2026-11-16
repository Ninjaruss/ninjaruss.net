import { describe, it, expect } from 'vitest';
import { ogLocale, translatedAlternates } from '../utils/i18n';

describe('translatedAlternates', () => {
  it('pairs the English homepage with the Japanese introduction', () => {
    expect(translatedAlternates('/')).toEqual([
      { hreflang: 'en', path: '/' },
      { hreflang: 'ja', path: '/ja/' },
    ]);
  });

  it('returns the same pair from the Japanese side', () => {
    expect(translatedAlternates('/ja')).toEqual([
      { hreflang: 'en', path: '/' },
      { hreflang: 'ja', path: '/ja/' },
    ]);
  });

  // An hreflang URL that is not the page's canonical URL is discarded by
  // search engines, so the emitted path must carry the trailing slash the
  // build's canonical and sitemap both use.
  it('emits paths that match the canonical trailing-slash form', () => {
    for (const { path } of translatedAlternates('/ja')) {
      expect(path === '/' || path.endsWith('/')).toBe(true);
    }
  });

  it('tolerates the trailing slash the build emits', () => {
    expect(translatedAlternates('/ja/')).toEqual(translatedAlternates('/ja'));
  });

  it('returns nothing for a page with no translation', () => {
    expect(translatedAlternates('/notes')).toEqual([]);
    expect(translatedAlternates('/life')).toEqual([]);
  });

  it('does not treat a nested path as the paired page', () => {
    expect(translatedAlternates('/ja/something')).toEqual([]);
  });
});

describe('ogLocale', () => {
  it('maps the page language to an Open Graph locale', () => {
    expect(ogLocale('ja')).toBe('ja_JP');
    expect(ogLocale('en')).toBe('en_US');
  });

  it('falls back to the site default for a language it does not know', () => {
    expect(ogLocale('fr')).toBe('en_US');
  });
});
