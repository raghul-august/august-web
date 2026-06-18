/**
 * Normalizes raw markdown coming from the model before it is parsed:
 * - unifies CRLF line endings
 * - un-escapes ordered-list markers ("1\." -> "1.")
 * - collapses blank lines between ordered-list items and renumbers to "1."
 *   so react-markdown renders a single tight list.
 */
export function normalizeMarkdown(raw?: string | null): string {
  if (!raw) return '';
  let text = raw.replace(/\r\n/g, '\n');
  text = text.replace(/(^|\n)(\s*\d+)\\\.(\s+)/g, '$1$2.$3');
  const orderedLineRe = /(^|\n)\s*\d+\.\s+/g;
  const matches = text.match(orderedLineRe);
  if (matches && matches.length >= 2) {
    text = text
      // collapse blank lines between list items
      .replace(/(\n\s*\d+\.\s+[^\n]+)\n{2,}(?=\s*\d+\.\s+)/g, '$1\n')
      // normalize numbering to "1."
      .replace(/(^|\n)\s*\d+\.\s+/g, '$11. ');
  }

  return text;
}
