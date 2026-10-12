import { SearchXIcon, UsersIcon } from "lucide-react";

import { AddContactButton } from "@/components/add-contact-button";
import { ContactRows } from "@/components/contact-rows";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { countContacts, listContacts } from "@/lib/contacts";
import { formatCount, formatNumber } from "@/lib/format";

const CONTACT_FORMS = ["контакт", "контакта", "контактов"] as const;

type SearchParams = PageProps<"/">["searchParams"];

function readQuery(value: string | string[] | undefined): string {
  const text = Array.isArray(value) ? value[0] : value;
  return (text ?? "").trim().slice(0, 100);
}

export async function ContactList({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = readQuery((await searchParams).q);
  const [contacts, total] = await Promise.all([
    listContacts(query),
    countContacts(),
  ]);

  if (total === 0) {
    return (
      <Empty className="mt-6 border bg-card py-14">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersIcon />
          </EmptyMedia>
          <EmptyTitle className="text-lg">Здесь пока никого нет</EmptyTitle>
          <EmptyDescription>
            Добавьте первого человека — кто это, откуда знакомы и о чём
            договорились.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <AddContactButton>Добавить контакт</AddContactButton>
        </EmptyContent>
      </Empty>
    );
  }

  if (contacts.length === 0) {
    return (
      <Empty className="mt-6 border bg-card py-14">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle className="text-lg">
            По запросу «{query}» никого не нашлось
          </EmptyTitle>
          <EmptyDescription>
            Проверьте написание или добавьте этого человека в контакты.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <AddContactButton name={query}>Добавить «{query}»</AddContactButton>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <>
      <p className="mt-2 px-3 text-sm text-muted-foreground" aria-live="polite">
        {query
          ? `Нашлось ${formatNumber(contacts.length)} из ${formatNumber(total)}`
          : formatCount(total, CONTACT_FORMS)}
      </p>
      <ContactRows contacts={contacts} query={query} />
    </>
  );
}

export function ContactListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Загружаем контакты">
      <Skeleton className="mt-3 ml-3 h-4 w-28" />
      <div className="mt-6">
        {Array.from({ length: 9 }, (_, index) => (
          <div key={index} className="flex min-h-15 items-center gap-3.5 px-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
