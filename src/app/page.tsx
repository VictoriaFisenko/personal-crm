import { Suspense } from "react";

import { ContactList, ContactListSkeleton } from "@/components/contact-list";
import {
  ContactsToolbar,
  ContactsToolbarFallback,
} from "@/components/contacts-toolbar";

export default function ContactsPage(props: PageProps<"/">) {
  return (
    <main className="group/contacts mx-auto w-full max-w-2xl flex-1 px-4 pt-10 pb-24 sm:pt-14">
      <header className="px-3">
        <p className="text-sm font-medium tracking-wide text-primary">
          Личная CRM
        </p>
        <h1 className="mt-1 font-heading text-4xl font-medium tracking-tight sm:text-5xl">
          Контакты
        </h1>
        <p className="mt-3 max-w-md text-pretty text-muted-foreground">
          Люди, которых я знаю лично: кто это, откуда знакомы и о чём
          договорились.
        </p>
      </header>

      <div className="mt-5">
        <Suspense fallback={<ContactsToolbarFallback />}>
          <ContactsToolbar />
        </Suspense>

        {/* Dimmed while a search is on its way; the delay hides quick answers. */}
        <div className="transition-opacity duration-200 group-has-data-pending/contacts:opacity-50 group-has-data-pending/contacts:delay-150">
          <Suspense fallback={<ContactListSkeleton />}>
            <ContactList searchParams={props.searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
