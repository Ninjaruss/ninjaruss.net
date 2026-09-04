import { describe, it, expect } from 'vitest';
import { parseSubstackFeed } from '../utils/substack';

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

  it('returns [] for malformed input rather than throwing', () => {
    expect(parseSubstackFeed('not xml at all <<<')).toEqual([]);
    expect(parseSubstackFeed('')).toEqual([]);
  });

  it('skips an item with no link', () => {
    const xml = '<rss><channel><item><title>Orphan</title></item></channel></rss>';
    expect(parseSubstackFeed(xml)).toEqual([]);
  });
});
