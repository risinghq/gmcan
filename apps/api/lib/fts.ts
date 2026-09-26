/**
 * Builds an FTS5 MATCH expression for word-prefix search, optionally scoped
 * to `columns`. Extracts words using Unicode character classes and quotes them
 * to treat FTS5 operators as plain text. Returns null if input has no words.
 */
export function ftsPrefixQuery(input: string, columns?: readonly string[]): string | null {
  const words = input.match(/[\p{L}\p{N}\p{M}]+/gu);
  if (!words) return null;
  const filter = columns ? `{${columns.join(" ")}} : ` : "";
  return words.map((word) => `${filter}"${word}"*`).join(" ");
}
