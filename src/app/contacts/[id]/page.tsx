import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ContactAvatar } from "@/components/contact-avatar";
import { NoteComposer } from "@/components/note-composer";
import { NoteItem } from "@/components/note-item";
import { Skeleton } from "@/components/ui/skeleton";
import { getContact, listNotes, parseContactId } from "@/lib/contacts";
import {
  formatCount,
  formatDate,
  formatDateTime,
  toTelHref,
} from "@/lib/format";

type Props = PageProps<"/contacts/[id]">;

const NOTE_FORMS = ["заметка", "заметки", "заметок"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseContactId((await params).id);
  const contact = id === null ? null : await getContact(id);
  return { title: contact?.name ?? "Контакт не найден" };
}

export default function ContactPage({ params }: Props) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6 pb-24 sm:pt-10">
      <Link
        href="/"
        className="-ml-1 inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ArrowLeftIcon aria-hidden className="size-4" />
        Все контакты
      </Link>

      <Suspense fallback={<ContactCardSkeleton />}>
        <ContactCard params={params} />
      </Suspense>
    </main>
  );
}

async function ContactCard({ params }: Pick<Props, "params">) {
  const id = parseContactId((await params).id);
  if (id === null) notFound();

  const [contact, notes] = await Promise.all([getContact(id), listNotes(id)]);
  if (!contact) notFound();

  const telHref = contact.phone ? toTelHref(contact.phone) : null;

  return (
    <article className="mt-6">
      <header className="flex items-center gap-4 px-1 sm:gap-5">
        <ContactAvatar name={contact.name} size="lg" />
        <div className="min-w-0">
          <h1 className="font-heading text-3xl font-medium tracking-tight break-words sm:text-4xl">
            {contact.name}
          </h1>
          {contact.about && (
            <p className="mt-1 text-lg break-words text-muted-foreground">
              {contact.about}
            </p>
          )}
        </div>
      </header>

      <dl className="mt-8 divide-y rounded-2xl border bg-card">
        <DetailRow label="Откуда знакомы">{contact.howWeMet}</DetailRow>
        <DetailRow label="Телефон">
          {contact.phone &&
            (telHref ? (
              <a href={telHref} className={linkClass}>
                {contact.phone}
              </a>
            ) : (
              contact.phone
            ))}
        </DetailRow>
        <DetailRow label="Почта">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className={linkClass}>
              {contact.email}
            </a>
          )}
        </DetailRow>
      </dl>

      <section aria-labelledby="notes-heading" className="mt-10">
        <div className="mb-4 flex items-baseline justify-between gap-3 px-1">
          <h2 id="notes-heading" className="font-heading text-2xl font-medium">
            Заметки
          </h2>
          {notes.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {formatCount(notes.length, NOTE_FORMS)}
            </p>
          )}
        </div>

        <NoteComposer contactId={contact.id} hasNotes={notes.length > 0}>
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              body={note.body}
              date={formatDateTime(note.createdAt)}
            />
          ))}
        </NoteComposer>
      </section>

      <p className="mt-10 px-1 text-sm text-muted-foreground">
        В контактах с {formatDate(contact.createdAt)}
      </p>
    </article>
  );
}

const linkClass =
  "rounded-sm text-primary underline decoration-primary/30 underline-offset-4 outline-none transition-colors hover:decoration-primary focus-visible:ring-3 focus-visible:ring-ring/50";

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-x-4 gap-y-0.5 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:px-5">
      <dt className="text-sm text-muted-foreground sm:pt-px sm:text-base">
        {label}
      </dt>
      <dd className="min-w-0 break-words">
        {children || <span className="text-muted-foreground/70">не указано</span>}
      </dd>
    </div>
  );
}

function ContactCardSkeleton() {
  return (
    <div className="mt-6" aria-busy="true" aria-label="Загружаем контакт">
      <div className="flex items-center gap-4 px-1 sm:gap-5">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-3/5" />
          <Skeleton className="h-5 w-2/5" />
        </div>
      </div>
      <Skeleton className="mt-8 h-37 rounded-2xl" />
      <Skeleton className="mt-10 h-8 w-32" />
      <Skeleton className="mt-4 h-36 rounded-2xl" />
    </div>
  );
}
