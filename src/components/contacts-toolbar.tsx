"use client";

import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { AddContactDialog } from "@/components/add-contact-dialog";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { contactsUi } from "@/lib/contacts-ui-store";

// Wait for a pause in typing before asking the server for results.
const SEARCH_DELAY_MS = 200;

export function ContactsToolbar() {
  const router = useRouter();
  const urlQuery = useSearchParams().get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  const [isPending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  // The search lives in the URL, so a reload or a shared link keeps it.
  function search(value: string) {
    clearTimeout(timer.current);
    const q = value.trim();
    startTransition(() => {
      router.replace(q ? `/?q=${encodeURIComponent(q)}` : "/", {
        scroll: false,
      });
    });
    window.scrollTo({ top: 0 });
  }

  function handleChange(value: string) {
    setQuery(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(value), SEARCH_DELAY_MS);
  }

  function clear() {
    setQuery("");
    search("");
    inputRef.current?.focus();
  }

  function handleCreated(contact: { id: number; name: string }) {
    // Show the whole list again, so the new contact is visible in it.
    if (query || urlQuery) {
      setQuery("");
      search("");
    }
    contactsUi.highlight(contact.id);
    toast.success("Контакт добавлен", {
      description: contact.name,
      action: {
        label: "Открыть",
        onClick: () => router.push(`/contacts/${contact.id}`),
      },
    });
  }

  return (
    <div
      data-pending={isPending ? "" : undefined}
      className="sticky top-0 z-20 -mx-4 flex items-center gap-2 bg-background px-4 py-3"
    >
      <InputGroup className="h-10 bg-card">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") search(query);
            if (event.key === "Escape" && query) clear();
          }}
          placeholder="Найти по имени"
          aria-label="Поиск по имени"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          className="[&::-webkit-search-cancel-button]:hidden"
        />
        {(isPending || query) && (
          <InputGroupAddon align="inline-end">
            {isPending ? (
              <Spinner aria-label="Ищем" className="mx-1" />
            ) : (
              <InputGroupButton
                size="icon-xs"
                aria-label="Очистить поиск"
                onClick={clear}
              >
                <XIcon />
              </InputGroupButton>
            )}
          </InputGroupAddon>
        )}
      </InputGroup>

      <Button
        size="lg"
        className="h-10 px-3.5"
        onClick={() => contactsUi.openAddDialog()}
      >
        <PlusIcon data-icon="inline-start" />
        <span className="max-sm:sr-only">Добавить контакт</span>
      </Button>

      <AddContactDialog onCreated={handleCreated} />
    </div>
  );
}

// Shown in the prerendered page shell until the real toolbar takes over.
export function ContactsToolbarFallback() {
  return (
    <div className="sticky top-0 z-20 -mx-4 flex items-center gap-2 bg-background px-4 py-3">
      <InputGroup className="h-10 bg-card">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder="Найти по имени"
          aria-label="Поиск по имени"
          disabled
        />
      </InputGroup>
      <Button size="lg" className="h-10 px-3.5" disabled>
        <PlusIcon data-icon="inline-start" />
        <span className="max-sm:sr-only">Добавить контакт</span>
      </Button>
    </div>
  );
}
