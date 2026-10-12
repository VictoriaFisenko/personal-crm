"use client";

import Link from "next/link";
import { memo, useEffect, useMemo, useRef, useState } from "react";

import { ContactAvatar } from "@/components/contact-avatar";
import type { ContactListItem } from "@/lib/contacts";
import { contactsUi, useContactsUi } from "@/lib/contacts-ui-store";
import { getGroupLetter } from "@/lib/format";
import { splitByMatches, toSearchTerms } from "@/lib/search";

// The list is cut into blocks of this many rows. A block is drawn only when
// the user scrolls near it; until then it is an empty box of the same height.
// With a thousand contacts the page builds a few dozen rows instead of all.
const BLOCK_SIZE = 30;

// How close to the screen a block must be before it is drawn.
const DRAW_AHEAD = "800px 0px";

// Rows at the top of the list are on screen from the start: draw them at once.
const ROWS_DRAWN_AT_ONCE = 30;

type Block = {
  // Id of the first contact: stable name for the block's DOM element.
  firstId: number;
  contacts: ContactListItem[];
  drawNow: boolean;
};

type Section = {
  // Letter heading; null for search results, which are one flat list.
  letter: string | null;
  blocks: Block[];
};

function toSections(contacts: ContactListItem[], grouped: boolean): Section[] {
  const groups = new Map<string | null, ContactListItem[]>();
  for (const contact of contacts) {
    const letter = grouped ? getGroupLetter(contact.name) : null;
    const group = groups.get(letter);
    if (group) group.push(contact);
    else groups.set(letter, [contact]);
  }

  let rowsBefore = 0;
  return [...groups].map(([letter, group]) => {
    const blocks: Block[] = [];
    for (let i = 0; i < group.length; i += BLOCK_SIZE) {
      const slice = group.slice(i, i + BLOCK_SIZE);
      blocks.push({
        firstId: slice[0].id,
        contacts: slice,
        drawNow: rowsBefore < ROWS_DRAWN_AT_ONCE,
      });
      rowsBefore += slice.length;
    }
    return { letter, blocks };
  });
}

export function ContactRows({
  contacts,
  query,
}: {
  contacts: ContactListItem[];
  query: string;
}) {
  const highlightId = useContactsUi((state) => state.highlightId);
  const flashId = useContactsUi((state) => state.flashId);

  const terms = useMemo(() => toSearchTerms(query), [query]);
  const sections = useMemo(
    () => toSections(contacts, query === ""),
    [contacts, query],
  );

  // Scroll to a just-added contact and flash its row. Runs again whenever the
  // server sends a fresh list, so it also works if the contact arrives later.
  useEffect(() => {
    if (highlightId === null) return;

    const top = findRowTop(sections, highlightId);
    if (top === null) return;

    // Glide to a row that is close by; jump to one that is far away, so the
    // flash is not over before a long ride through hundreds of rows ends.
    const distance = Math.abs(top - window.innerHeight / 2);
    const isNearby = distance < window.innerHeight * 1.5;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: window.scrollY + top - window.innerHeight / 2,
      behavior: isNearby && !reduceMotion ? "smooth" : "auto",
    });

    contactsUi.flash(highlightId);
  }, [highlightId, sections]);

  // Leaving the page mid-flash must not make the row flash again on return.
  useEffect(() => contactsUi.endFlash, []);

  return sections.map((section) => (
    // Search results start from scratch on every new query.
    <section
      key={section.letter ?? `search:${query}`}
      aria-label={
        section.letter ? `Имена на букву ${section.letter}` : "Результаты поиска"
      }
      className={section.letter ? undefined : "mt-3"}
    >
      {section.letter && (
        <h2 className="sticky top-16 z-10 -mx-4 mt-3 bg-background px-7 py-1.5 font-heading text-lg text-primary">
          {section.letter}
        </h2>
      )}
      {section.blocks.map((block, blockIndex) => (
        <RowBlock
          key={blockIndex}
          block={block}
          terms={terms}
          flashId={flashId}
        />
      ))}
    </section>
  ));
}

// Where a contact's row is (or will be) on screen: the distance from the top
// of the window to the middle of the row. Works for blocks not drawn yet.
function findRowTop(sections: Section[], contactId: number): number | null {
  for (const section of sections) {
    for (const block of section.blocks) {
      const index = block.contacts.findIndex((c) => c.id === contactId);
      if (index === -1) continue;

      const element = document.getElementById(`contacts-from-${block.firstId}`);
      if (!element) return null;

      const box = element.getBoundingClientRect();
      const rowHeight = box.height / block.contacts.length;
      return box.top + rowHeight * (index + 0.5);
    }
  }
  return null;
}

const RowBlock = memo(function RowBlock({
  block,
  terms,
  flashId,
}: {
  block: Block;
  terms: string[];
  flashId: number | null;
}) {
  const placeholder = useRef<HTMLDivElement>(null);
  const [isDrawn, setIsDrawn] = useState(block.drawNow);

  useEffect(() => {
    const element = placeholder.current;
    if (isDrawn || !element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setIsDrawn(true);
      },
      { rootMargin: DRAW_AHEAD },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isDrawn]);

  const id = `contacts-from-${block.firstId}`;

  if (!isDrawn) {
    return (
      <div
        ref={placeholder}
        id={id}
        aria-hidden
        style={{
          height: `calc(${block.contacts.length} * var(--contact-row-height))`,
        }}
      />
    );
  }

  return (
    <ul id={id}>
      {block.contacts.map((contact) => (
        <ContactRow
          key={contact.id}
          contact={contact}
          terms={terms}
          isFlashing={contact.id === flashId}
        />
      ))}
    </ul>
  );
});

type ContactRowProps = {
  contact: ContactListItem;
  terms: string[];
  isFlashing: boolean;
};

// A fresh list from the server brings new objects even for unchanged people,
// so rows are compared by what they show. After adding one contact, only the
// rows that really changed are drawn again.
function isSameRow(previous: ContactRowProps, next: ContactRowProps) {
  return (
    previous.terms === next.terms &&
    previous.isFlashing === next.isFlashing &&
    previous.contact.id === next.contact.id &&
    previous.contact.name === next.contact.name &&
    previous.contact.about === next.contact.about &&
    previous.contact.howWeMet === next.contact.howWeMet
  );
}

const ContactRow = memo(function ContactRow({
  contact,
  terms,
  isFlashing,
}: ContactRowProps) {
  const details = [contact.about, contact.howWeMet].filter(Boolean).join(" · ");

  return (
    <li
      id={`contact-${contact.id}`}
      data-flash={isFlashing ? "" : undefined}
      onAnimationEnd={isFlashing ? contactsUi.endFlash : undefined}
    >
      <Link href={`/contacts/${contact.id}`} className="contact-link">
        <ContactAvatar name={contact.name} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">
            {splitByMatches(contact.name, terms).map((segment, index) =>
              segment.match ? (
                <mark
                  key={index}
                  className="rounded-xs bg-highlight text-inherit"
                >
                  {segment.text}
                </mark>
              ) : (
                segment.text
              ),
            )}
          </span>
          {details && (
            <span className="block truncate text-sm text-muted-foreground">
              {details}
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}, isSameRow);
