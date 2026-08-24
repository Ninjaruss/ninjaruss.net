/**
 * Traces validation/hash/rate-limit logic. Pure aside from node:crypto's
 * createHash, so this file must never be imported into a browser
 * <script> block (see tracesRotation.ts for the client-safe counterpart).
 */
import { z } from 'astro/zod';
import { createHash } from 'node:crypto';

export const NAME_MAX_LENGTH = 40;
export const MESSAGE_MAX_LENGTH = 100;
export const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

export const tracesMessageSchema = z.object({
  name: z.string().min(1).max(NAME_MAX_LENGTH),
  message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
});

export type TracesMessageInput = z.infer<typeof tracesMessageSchema>;

/** Collapses whitespace/newlines/control chars to single spaces and trims. */
export function sanitizeText(input: string): string {
  return input
    .replace(/[\x00-\x1f\x7f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** sha256("<ip>:<salt>") — the raw ip is never stored or returned. */
export function hashIp(ip: string, salt: string): string {
  return createHash('sha256').update(`${ip}:${salt}`).digest('hex');
}

export function isRateLimited(
  lastSubmittedAt: Date | null,
  now: Date,
  windowMs: number = RATE_LIMIT_WINDOW_MS,
): boolean {
  if (!lastSubmittedAt) return false;
  return now.getTime() - lastSubmittedAt.getTime() < windowMs;
}

/**
 * Intentionally narrow: this default set is limited to unambiguous
 * self-harm-incitement phrases, which have no legitimate use in a "leave
 * your mark" message and so carry zero false-positive risk. It is NOT a
 * general profanity or slur filter — deciding what else counts as
 * unacceptable for this specific site is an editorial call for the site
 * owner, not something to hardcode generically here. Extend this array
 * directly (it's a plain exported list, not config) with anything else
 * you want blocked; every entry is matched as a whole word/phrase
 * (case-insensitive, basic leetspeak-normalized) so casual profanity,
 * dark humor, and heated-but-ordinary opinions all pass through
 * untouched. The admin-delete route (DELETE /api/traces/:id) is the
 * backstop for everything this list doesn't catch.
 */
export const BLOCKED_TERMS: string[] = [
  'kys',
  'kill yourself',
  'go kill yourself',
  'go die',
];

/** Lowercases and undoes common leetspeak substitutions before matching. */
function normalizeForBlocklist(text: string): string {
  return text
    .toLowerCase()
    .replace(/[@4]/g, 'a')
    .replace(/[1!|]/g, 'i')
    .replace(/0/g, 'o')
    .replace(/3/g, 'e')
    .replace(/[$5]/g, 's')
    .replace(/[+7]/g, 't');
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Whole-word/phrase match against BLOCKED_TERMS — never a bare substring match. */
export function containsBlockedTerm(text: string): boolean {
  const normalized = normalizeForBlocklist(text);
  return BLOCKED_TERMS.some(term => new RegExp(`\\b${escapeRegExp(term)}\\b`).test(normalized));
}

/**
 * Sanitizes then validates. Throws on invalid input (a ZodError for
 * shape/length violations, a plain Error for a blocked term) — callers
 * should treat any thrown error the same way (generic rejection, no
 * detail about which check failed, so nothing helps a bad-faith
 * submitter iterate around it).
 */
export function parseTracesInput(raw: { name: unknown; message: unknown }): TracesMessageInput {
  const name = sanitizeText(typeof raw.name === 'string' ? raw.name : '');
  const message = sanitizeText(typeof raw.message === 'string' ? raw.message : '');
  const parsed = tracesMessageSchema.parse({ name, message });
  if (containsBlockedTerm(parsed.name) || containsBlockedTerm(parsed.message)) {
    throw new Error('blocked term');
  }
  return parsed;
}
