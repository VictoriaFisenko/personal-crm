import "server-only";

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { contacts, notes } from "@/db/schema";
import { toSearchTerms } from "@/lib/search";

// ICU collation sorts Cyrillic the way a Russian reader expects:
// "Пётр" next to "Петр", not after "Пять" as the default byte order does.
const byName = sql`${contacts.name} collate "ru-x-icu"`;

function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, "\\$&");
}

// All contacts whose name contains every word of the query, in any order.
export async function listContacts(query: string) {
  const conditions = toSearchTerms(query).map(
    (term) =>
      sql`replace(lower(${contacts.name}), 'ё', 'е') like ${`%${escapeLike(term)}%`}`,
  );

  return db
    .select({
      id: contacts.id,
      name: contacts.name,
      about: contacts.about,
      howWeMet: contacts.howWeMet,
    })
    .from(contacts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(byName, asc(contacts.id));
}

export type ContactListItem = Awaited<ReturnType<typeof listContacts>>[number];

export async function countContacts(): Promise<number> {
  return db.$count(contacts);
}

// Memoized per request: the page and its metadata share one query.
export const getContact = cache(async (id: number) => {
  const [contact] = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, id))
    .limit(1);
  return contact ?? null;
});

export async function listNotes(contactId: number) {
  return db
    .select()
    .from(notes)
    .where(eq(notes.contactId, contactId))
    .orderBy(desc(notes.createdAt), desc(notes.id));
}

type NewContact = {
  name: string;
  about: string;
  howWeMet: string;
  phone: string;
  email: string;
  note: string;
};

// Creates the contact and, if given, its first note in one transaction.
export async function createContact(input: NewContact) {
  return db.transaction(async (tx) => {
    const [contact] = await tx
      .insert(contacts)
      .values({
        name: input.name,
        about: input.about || null,
        howWeMet: input.howWeMet || null,
        phone: input.phone || null,
        email: input.email || null,
      })
      .returning({ id: contacts.id, name: contacts.name });

    if (input.note) {
      await tx.insert(notes).values({ contactId: contact.id, body: input.note });
    }

    return contact;
  });
}

// Returns false when the contact does not exist.
export async function createNote(
  contactId: number,
  body: string,
): Promise<boolean> {
  const contact = await getContact(contactId);
  if (!contact) return false;

  await db.insert(notes).values({ contactId, body });
  return true;
}

// Route params are strings; ids are positive integers within the int4 range.
export function parseContactId(value: string): number | null {
  if (!/^[1-9]\d{0,9}$/.test(value)) return null;
  const id = Number(value);
  return id <= 2147483647 ? id : null;
}
