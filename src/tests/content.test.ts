import { describe, it, expect } from 'vitest';
import { stripMarkdown, hasMinimalContent } from '../utils/content';

describe('stripMarkdown', () => {
  it('strips raw HTML tags, keeping inner text', () => {
    expect(stripMarkdown('Hello <strong>world</strong>')).toBe('Hello world');
  });

  it('strips iframe embeds entirely', () => {
    const input = '<iframe width="560" height="315" src="https://www.youtube.com/embed/x"></iframe>\n\nA video essay about Marie.';
    expect(stripMarkdown(input)).toBe('A video essay about Marie.');
  });

  it('strips self-closing and multi-line tags', () => {
    expect(stripMarkdown('before <img\n  src="x.png"\n/> after')).toBe('before after');
  });

  it('leaves comparison operators in prose alone', () => {
    expect(stripMarkdown('if a < b and b > c then stop')).toBe('if a < b and b > c then stop');
  });

  it('still strips markdown syntax', () => {
    expect(stripMarkdown('# Head\n**bold** [link](https://x.com)')).toBe('Head bold link');
  });
});

describe('hasMinimalContent', () => {
  it('treats HTML-only bodies as minimal', () => {
    expect(hasMinimalContent('<iframe src="https://youtube.com/embed/x"></iframe>')).toBe(true);
  });
});
