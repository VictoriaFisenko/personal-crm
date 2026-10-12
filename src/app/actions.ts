"use server";

import { refresh } from "next/cache";

import { createContact, createNote } from "@/lib/contacts";
import {
  readContactForm,
  validateContactForm,
  validateNote,
  type ContactFormErrors,
  type ContactFormValues,
} from "@/lib/validation";

export type AddContactResult =
  | { ok: true; contact: { id: number; name: string } }
  | { ok: false; errors: ContactFormErrors; values: ContactFormValues };

export async function addContact(formData: FormData): Promise<AddContactResult> {
  const values = readContactForm(formData);
  const errors = validateContactForm(values);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, values };
  }

  const contact = await createContact(values);

  // Re-render the open page so the list shows the new contact right away.
  refresh();
  return { ok: true, contact };
}

export type AddNoteResult = { ok: true } | { ok: false; error: string };

export async function addNote(
  contactId: number,
  body: string,
): Promise<AddNoteResult> {
  if (!Number.isInteger(contactId) || contactId < 1 || typeof body !== "string") {
    return { ok: false, error: "Не получилось сохранить заметку" };
  }

  const text = body.trim();
  const error = validateNote(text);
  if (error) {
    return { ok: false, error };
  }

  const created = await createNote(contactId, text);
  if (!created) {
    return { ok: false, error: "Этого контакта больше нет в списке" };
  }

  refresh();
  return { ok: true };
}
