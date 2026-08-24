/**
 * Deterministic per-id rotation for the homepage Traces band's name
 * pills, in [-4, 4] degrees at 0.1° steps — same djb2-xor seeding as
 * shelfWall's wallRotation, seeded from the numeric row id instead of a
 * slug. No imports: this file is bundled directly into a homepage
 * <script> block, so it must stay dependency-free.
 */
export function bandRotation(id: number): number {
  let h = 5381;
  const s = String(id);
  for (let i = 0; i < s.length; i++) {
    h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  }
  return ((h % 81) - 40) / 10;
}
