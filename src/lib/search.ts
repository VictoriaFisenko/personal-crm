// Shared by the database query and the UI, so both agree on what "matches" means.

const MAX_TERMS = 8;

// Case-insensitive, and "ё" equals "е": typing "Семен" finds "Семён".
export function normalizeForSearch(text: string): string {
  return text.toLowerCase().replaceAll("ё", "е");
}

export function toSearchTerms(query: string): string[] {
  return normalizeForSearch(query)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, MAX_TERMS);
}

export type TextSegment = { text: string; match: boolean };

// Splits text into matching and non-matching pieces so matches can be marked.
export function splitByMatches(text: string, terms: string[]): TextSegment[] {
  const normalized = normalizeForSearch(text);
  // Positions only line up when normalization keeps the length unchanged.
  if (terms.length === 0 || normalized.length !== text.length) {
    return [{ text, match: false }];
  }

  const marked = new Array<boolean>(text.length).fill(false);
  for (const term of terms) {
    let from = 0;
    for (;;) {
      const at = normalized.indexOf(term, from);
      if (at === -1) break;
      marked.fill(true, at, at + term.length);
      from = at + term.length;
    }
  }

  const segments: TextSegment[] = [];
  let start = 0;
  for (let i = 1; i <= text.length; i++) {
    if (i === text.length || marked[i] !== marked[start]) {
      segments.push({ text: text.slice(start, i), match: marked[start] });
      start = i;
    }
  }
  return segments;
}
