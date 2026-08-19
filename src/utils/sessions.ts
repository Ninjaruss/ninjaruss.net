export const STAT_ORDER = [
  'Determination',
  'Insight',
  'Expression',
  'Sincerity',
  'Chaos',
] as const;

export type StatName = (typeof STAT_ORDER)[number];

/** The one stat-colour table. Anything that paints a stat (the arc card, the
 *  homepage tile teaser, the page-transition card) reads from here — do not
 *  re-declare these hexes anywhere else. */
export const STAT_COLORS: Record<StatName, string> = {
  Determination: '#ff4040',
  Insight:       '#4ab0ff',
  Expression:    '#a855f7',
  Sincerity:     '#ffe52c',
  Chaos:         '#2dd4bf',
};

/** `#ff4040` → `255,64,64` — for building rgba()/feColorMatrix values from
 *  a STAT_COLORS entry without restating the channels. */
export function hexToRgbTriplet(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}
