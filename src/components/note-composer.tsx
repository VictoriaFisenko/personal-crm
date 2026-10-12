"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { addNote } from "@/app/actions";
import { NoteItem } from "@/components/note-item";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { LIMITS } from "@/lib/validation";

type PendingNote = { id: string; body: string };

// The form for a new note and the notes timeline. Saved notes come from the
// server as children; notes that are still being saved are shown above them.
export function NoteComposer({
  contactId,
  hasNotes,
  children,
}: {
  contactId: number;
  hasNotes: boolean;
  children: React.ReactNode;
}) {
  const [pendingNotes, addPendingNote] = useOptimistic(
    [] as PendingNote[],
    (current, note: PendingNote) => [note, ...current],
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const body = textarea.value.trim();
    if (!body) {
      textarea.focus();
      return;
    }

    // Clear the field right away; the note shows up below as "saving".
    textarea.value = "";
    setError(null);

    startTransition(async () => {
      addPendingNote({ id: crypto.randomUUID(), body });

      let message: string | null = null;
      try {
        const result = await addNote(contactId, body);
        if (!result.ok) message = result.error;
      } catch {
        message =
          "Не получилось сохранить заметку. Проверьте, что база данных запущена.";
      }

      if (message) {
        // Give the text back so nothing the user wrote is lost.
        if (!textarea.value) textarea.value = body;
        setError(message);
        return;
      }

      toast.success("Заметка сохранена");
    });
  }

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="rounded-2xl border bg-card p-3 transition-shadow focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30"
      >
        <Textarea
          ref={textareaRef}
          name="body"
          maxLength={LIMITS.note}
          placeholder="О чём поговорили и о чём договорились?"
          aria-label="Новая заметка"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "note-error" : undefined}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              submit();
            }
          }}
          className="max-h-80 min-h-20 resize-none border-0 bg-transparent px-1.5 py-1 text-base shadow-none focus-visible:ring-0 aria-invalid:ring-0 md:text-base"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="pl-1.5 text-xs text-muted-foreground max-sm:hidden">
            Ctrl + Enter — сохранить
          </p>
          <Button type="submit" size="lg" className="ml-auto">
            {isPending && <Spinner aria-hidden />}
            Сохранить заметку
          </Button>
        </div>
      </form>

      {error && (
        <p
          id="note-error"
          role="alert"
          className="mt-2 px-1 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {hasNotes || pendingNotes.length > 0 ? (
        <ol className="mt-7 ml-1.5">
          {pendingNotes.map((note) => (
            <NoteItem key={note.id} body={note.body} pending />
          ))}
          {children}
        </ol>
      ) : (
        <p className="mt-6 px-1 text-pretty text-muted-foreground">
          Заметок пока нет. Запишите, о чём поговорили, — пригодится перед
          следующей встречей.
        </p>
      )}
    </>
  );
}
