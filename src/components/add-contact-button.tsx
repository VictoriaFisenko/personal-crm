"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { contactsUi } from "@/lib/contacts-ui-store";

// Opens the "new contact" dialog, optionally with the name already filled in.
export function AddContactButton({
  name,
  children,
}: {
  name?: string;
  children: React.ReactNode;
}) {
  return (
    <Button size="lg" onClick={() => contactsUi.openAddDialog(name)}>
      <PlusIcon data-icon="inline-start" />
      {children}
    </Button>
  );
}
