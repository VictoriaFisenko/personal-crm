import { cn } from "@/lib/utils";

// One entry of the notes timeline: a dot on the rail, the date, the text.
export function NoteItem({
  body,
  date,
  pending = false,
}: {
  body: string;
  // Already formatted; omitted while the note is still being saved.
  date?: string;
  pending?: boolean;
}) {
  return (
    <li
      className={cn(
        "relative border-l border-border pb-7 pl-6 last:pb-1",
        pending && "opacity-60",
      )}
    >
      <span
        aria-hidden
        className="absolute top-1.5 -left-[4.5px] size-2 rounded-full bg-primary ring-4 ring-background"
      />
      <p className="text-sm text-muted-foreground">
        {pending ? "Сохраняем…" : date}
      </p>
      <p className="mt-1 break-words whitespace-pre-wrap">{body}</p>
    </li>
  );
}
