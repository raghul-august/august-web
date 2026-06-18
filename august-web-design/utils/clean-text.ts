/**
 * Normalize garbage whitespace in flattened clinical free-text (report
 * narratives, conclusions, non-numeric observation values). Collapses
 * CRLF blank-line stacks, NBSP/unicode/zero-width whitespace, and space
 * runs, while preserving paragraph breaks. Use only on clinical free-text
 * — NOT on structured fields (names, codes, numeric values, IDs, URLs).
 */
export function cleanClinicalText(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .replace(/\r\n?/g, '\n')                                          // CRLF / lone CR -> LF
    .replace(/[\t\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ') // NBSP/tabs/unicode spaces -> space
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')                       // zero-width chars -> remove
    .replace(/[ ]{2,}/g, ' ')                                          // collapse 2+ spaces -> 1
    .replace(/[ ]+\n/g, '\n')                                          // strip trailing spaces before newline
    .replace(/\n{3,}/g, '\n\n')                                        // collapse 3+ newlines -> 2 (keep paragraphs)
    .trim();
}
