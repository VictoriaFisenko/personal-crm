const numberFormat = new Intl.NumberFormat("ru-RU");
const pluralRules = new Intl.PluralRules("ru-RU");
const dateTimeFormat = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "long",
  timeStyle: "short",
});
const dateFormat = new Intl.DateTimeFormat("ru-RU", { dateStyle: "long" });

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

// Russian plural forms: 1 контакт, 2 контакта, 5 контактов.
export function pluralize(
  count: number,
  forms: readonly [one: string, few: string, many: string],
): string {
  const rule = pluralRules.select(count);
  if (rule === "one") return forms[0];
  if (rule === "few") return forms[1];
  return forms[2];
}

export function formatCount(
  count: number,
  forms: readonly [one: string, few: string, many: string],
): string {
  return `${formatNumber(count)} ${pluralize(count, forms)}`;
}

export function formatDateTime(date: Date): string {
  return dateTimeFormat.format(date);
}

export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

function firstLetter(word: string): string {
  return Array.from(word.replace(/^[^\p{L}\p{N}]+/u, ""))[0] ?? "";
}

// "Анна Петрова" -> "АП", "Саша из спортзала" -> "СИ", "" -> "?"
export function getInitials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .map(firstLetter)
    .filter(Boolean)
    .slice(0, 2)
    .join("");
  return letters.toLocaleUpperCase("ru-RU") || "?";
}

// Letter used to group the list. "Ё" is filed under "Е", like in a paper address book.
export function getGroupLetter(name: string): string {
  const letter = firstLetter(name).toLocaleUpperCase("ru-RU");
  if (letter === "Ё") return "Е";
  return /\p{L}/u.test(letter) ? letter : "#";
}

const AVATAR_HUES = [28, 62, 105, 150, 195, 240, 285, 335];

// Stable hue per name, so a person keeps the same avatar color everywhere.
export function getAvatarHue(name: string): number {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  }
  return AVATAR_HUES[hash % AVATAR_HUES.length];
}

// Digits-only form for tel: links. Returns null when there is nothing to dial.
export function toTelHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 5) return null;
  return `tel:${phone.trim().startsWith("+") ? "+" : ""}${digits}`;
}
