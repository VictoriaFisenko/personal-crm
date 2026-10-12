"use client"; // Error boundaries must be Client Components

import { DatabaseZapIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <DatabaseZapIcon />
          </EmptyMedia>
          <EmptyTitle className="text-lg">Не получилось загрузить данные</EmptyTitle>
          <EmptyDescription>
            Скорее всего, не запущена база данных. Запустите Docker Desktop,
            выполните в папке проекта команду{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground">
              pnpm db:up
            </code>{" "}
            и попробуйте снова.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="lg" onClick={() => retry()}>
            Попробовать снова
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
