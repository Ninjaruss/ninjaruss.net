import { describe, it, expect } from 'vitest';
import { parseProtagonist, DEFAULT_PROTAGONIST } from '../utils/protagonist';

describe('parseProtagonist', () => {
  it('parses all three fields', () => {
    const md = `---\nname: NINJARUSS\nepithet: the fool who left for Japan\nportrait: /images/stream/portrait.png\n---\n`;
    expect(parseProtagonist(md)).toEqual({
      name: 'NINJARUSS',
      epithet: 'the fool who left for Japan',
      portrait: '/images/stream/portrait.png',
    });
  });

  it('strips surrounding quotes', () => {
    const md = `---\nname: "RUSS"\nepithet: 'wanderer'\n---\n`;
    const p = parseProtagonist(md);
    expect(p.name).toBe('RUSS');
    expect(p.epithet).toBe('wanderer');
  });

  it('falls back to defaults for missing fields', () => {
    expect(parseProtagonist(`---\nname: RUSS\n---\n`)).toEqual({
      name: 'RUSS', epithet: null, portrait: null,
    });
  });

  it('returns defaults for empty or frontmatter-less input', () => {
    expect(parseProtagonist('')).toEqual(DEFAULT_PROTAGONIST);
    expect(parseProtagonist('just some text')).toEqual(DEFAULT_PROTAGONIST);
  });

  it('ignores unknown keys and blank values', () => {
    const md = `---\nname: RUSS\nfavoriteFood: ramen\nepithet:\n---\n`;
    expect(parseProtagonist(md)).toEqual({ name: 'RUSS', epithet: null, portrait: null });
  });
});
