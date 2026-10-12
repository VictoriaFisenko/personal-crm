import { UserRoundXIcon } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserRoundXIcon />
          </EmptyMedia>
          <EmptyTitle className="text-lg">Такой страницы нет</EmptyTitle>
          <EmptyDescription>
            Возможно, ссылка устарела или в адресе опечатка.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            Ко всем контактам
          </Link>
        </EmptyContent>
      </Empty>
    </main>
  );
}
