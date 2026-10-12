// Shared limits and checks for user input. The server always re-validates:
// server actions are reachable by a direct POST, not only through the UI.

export const LIMITS = {
  name: 120,
  about: 200,
  howWeMet: 200,
  phone: 40,
  email: 254,
  note: 5000,
} as const;

export type ContactFormValues = {
  name: string;
  about: string;
  howWeMet: string;
  phone: string;
  email: string;
  note: string;
};

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

const FIELDS = Object.keys(LIMITS) as (keyof ContactFormValues)[];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readText(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export function readContactForm(formData: FormData): ContactFormValues {
  return {
    name: readText(formData, "name").replace(/\s+/g, " "),
    about: readText(formData, "about"),
    howWeMet: readText(formData, "howWeMet"),
    phone: readText(formData, "phone"),
    email: readText(formData, "email"),
    note: readText(formData, "note"),
  };
}

export function validateContactForm(
  values: ContactFormValues,
): ContactFormErrors {
  const errors: ContactFormErrors = {};

  for (const field of FIELDS) {
    if (values[field].length > LIMITS[field]) {
      errors[field] = `Слишком длинно: не больше ${LIMITS[field]} символов`;
    }
  }

  if (!values.name) {
    errors.name = "Напишите, как зовут человека";
  }

  if (values.email && !errors.email && !EMAIL_PATTERN.test(values.email)) {
    errors.email = "Похоже, в адресе опечатка";
  }

  return errors;
}

export function validateNote(body: string): string | null {
  if (!body) return "Заметка пустая — напишите хотя бы пару слов";
  if (body.length > LIMITS.note) {
    return `Слишком длинно: не больше ${LIMITS.note} символов`;
  }
  return null;
}
