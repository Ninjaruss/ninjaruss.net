/**
 * Pull a JSON object out of a chatbot reply. Models wrap JSON in prose and
 * code fences; we tolerate all of it. Strategy: try fenced block first, then
 * the outermost {...} span, then the raw text.
 */
export function extractJsonBlock(text: string): unknown {
  const candidates: string[] = [];

  const fence = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fence) candidates.push(fence[1]);

  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last > first) candidates.push(text.slice(first, last + 1));

  candidates.push(text);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // try the next strategy
    }
  }
  throw new Error('No JSON object found in the response text');
}
