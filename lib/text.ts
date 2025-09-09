export function truncateWords(input: unknown, maxWords = 10): string {
  const s = String(input ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (!s) return "";
  const words = s.split(" ");
  return words.length > maxWords
    ? words.slice(0, maxWords).join(" ") + "..."
    : s;
}
