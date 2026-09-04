import { describe, it, expect, afterEach, vi } from 'vitest';
import { parseSubstackFeed, fetchSubstackPosts } from '../utils/substack';

const FEED = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <title>ninjaruss</title>
  <item>
    <title><![CDATA[Why one must fall]]></title>
    <link>https://ninjaruss.substack.com/p/why-one-must-fall</link>
    <pubDate>Mon, 01 Sep 2026 12:00:00 GMT</pubDate>
    <description><![CDATA[<p>Potential man must die.</p>]]></description>
  </item>
  <item>
    <title>Gratitude &amp; its opposite</title>
    <link>https://ninjaruss.substack.com/p/gratitude</link>
    <pubDate>Mon, 25 Aug 2026 12:00:00 GMT</pubDate>
    <description>Plain text body</description>
  </item>
</channel></rss>`;

describe('parseSubstackFeed', () => {
  it('extracts each item in feed order', () => {
    const posts = parseSubstackFeed(FEED);
    expect(posts).toHaveLength(2);
    expect(posts[0].title).toBe('Why one must fall');
    expect(posts[0].link).toBe('https://ninjaruss.substack.com/p/why-one-must-fall');
    expect(posts[0].pubDate).toBe('Mon, 01 Sep 2026 12:00:00 GMT');
  });

  it('unwraps CDATA and decodes entities in titles', () => {
    expect(parseSubstackFeed(FEED)[1].title).toBe('Gratitude & its opposite');
  });

  it('strips markup from the description', () => {
    expect(parseSubstackFeed(FEED)[0].description).toBe('Potential man must die.');
  });

  it('returns [] for a feed with no items', () => {
    expect(parseSubstackFeed('<rss><channel></channel></rss>')).toEqual([]);
  });

  it('returns [] for input containing no items', () => {
    expect(parseSubstackFeed('not xml at all <<<')).toEqual([]);
    expect(parseSubstackFeed('')).toEqual([]);
  });

  it('skips an item with no link', () => {
    const xml = '<rss><channel><item><title>Orphan</title></item></channel></rss>';
    expect(parseSubstackFeed(xml)).toEqual([]);
  });
});

function itemFeed(title: string, description: string): string {
  return `<rss><channel><item>
    <title>${title}</title>
    <link>https://ninjaruss.substack.com/p/entities</link>
    <pubDate>Mon, 01 Sep 2026 12:00:00 GMT</pubDate>
    <description>${description}</description>
  </item></channel></rss>`;
}

describe('parseSubstackFeed entity decoding', () => {
  it('decodes decimal numeric entities to curly quotes', () => {
    const posts = parseSubstackFeed(itemFeed('&#8220;Quoted&#8221;', 'plain'));
    expect(posts[0].title).toBe('“Quoted”');
  });

  it('decodes hex numeric entities', () => {
    const posts = parseSubstackFeed(itemFeed('An em&#x2014;dash', 'plain'));
    expect(posts[0].title).toBe('An em—dash');
  });

  it('decodes named entities beyond the original five', () => {
    const posts = parseSubstackFeed(itemFeed('Wait&hellip;', 'plain'));
    expect(posts[0].title).toBe('Wait…');
  });

  it('matches the observed regression shape', () => {
    const description =
      'Time is running out, yet I have &#8220;all&#8221; the time in the world.';
    const posts = parseSubstackFeed(itemFeed('title', description));
    expect(posts[0].description).toBe(
      'Time is running out, yet I have “all” the time in the world.'
    );
  });

  it('decodes &amp; last so escaped entities are not double-decoded', () => {
    const posts = parseSubstackFeed(itemFeed('&amp;#8220;', 'plain'));
    expect(posts[0].title).toBe('&#8220;');
  });

  it('leaves a malformed or out-of-range numeric entity intact without throwing', () => {
    expect(() => parseSubstackFeed(itemFeed('&#zzz;', 'plain'))).not.toThrow();
    const posts = parseSubstackFeed(itemFeed('Bad &#99999999999; entity', 'plain'));
    expect(posts[0].title).toBe('Bad &#99999999999; entity');
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchSubstackPosts', () => {
  it('returns parsed posts capped at the limit', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(FEED, { status: 200 })));
    const posts = await fetchSubstackPosts(1);
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('Why one must fall');
  });

  it('returns [] when the network throws', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    await expect(fetchSubstackPosts()).resolves.toEqual([]);
  });

  it('returns [] on a non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 503 })));
    await expect(fetchSubstackPosts()).resolves.toEqual([]);
  });
});
