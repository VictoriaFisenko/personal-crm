"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";

import { addContact } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { contactsUi, useContactsUi } from "@/lib/contacts-ui-store";
import {
  LIMITS,
  readContactForm,
  type ContactFormErrors,
  type ContactFormValues,
} from "@/lib/validation";

type CreatedContact = { id: number; name: string };

type FormState = {
  values: ContactFormValues;
  errors: ContactFormErrors;
  // Set when saving failed for a reason the user cannot fix in the form.
  failed: boolean;
};

export function AddContactDialog({
  onCreated,
}: {
  onCreated: (contact: CreatedContact) => void;
}) {
  const open = useContactsUi((state) => state.addDialogOpen);
  const initialName = useContactsUi((state) => state.addDialogName);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) contactsUi.closeAddDialog();
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Новый контакт</DialogTitle>
          <DialogDescription>
            Обязательно только имя. Остальное — что помните.
          </DialogDescription>
        </DialogHeader>
        {/* The form lives inside the popup, so every opening starts clean. */}
        <AddContactForm initialName={initialName} onCreated={onCreated} />
      </DialogContent>
    </Dialog>
  );
}

function AddContactForm({
  initialName,
  onCreated,
}: {
  initialName: string;
  onCreated: (contact: CreatedContact) => void;
}) {
  const [state, formAction, isPending] = useActionState(
    async (previous: FormState, formData: FormData): Promise<FormState> => {
      let result;
      try {
        result = await addContact(formData);
      } catch {
        return { values: readContactForm(formData), errors: {}, failed: true };
      }

      if (!result.ok) {
        return { values: result.values, errors: result.errors, failed: false };
      }

      // Close inside a transition so the dialog disappears in the same frame
      // the refreshed list (with the new contact) appears.
      startTransition(() => contactsUi.closeAddDialog());
      onCreated(result.contact);
      return previous;
    },
    {
      values: {
        name: initialName,
        about: "",
        howWeMet: "",
        phone: "",
        email: "",
        note: "",
      },
      errors: {},
      failed: false,
    },
  );

  const { values, errors } = state;
  const formRef = useRef<HTMLFormElement>(null);

  // After a rejected submit, put the cursor into the first field to fix.
  useEffect(() => {
    formRef.current
      ?.querySelector<HTMLElement>("[aria-invalid='true']")
      ?.focus();
  }, [errors]);

  return (
    <form ref={formRef} action={formAction} noValidate className="contents">
      <FieldGroup className="gap-4">
        <Field data-invalid={errors.name ? true : undefined}>
          <FieldLabel htmlFor="contact-name">Имя</FieldLabel>
          <Input
            id="contact-name"
            name="name"
            defaultValue={values.name}
            maxLength={LIMITS.name}
            placeholder="Анна Петрова"
            autoComplete="off"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className="h-9"
          />
          <FieldError id="contact-name-error">{errors.name}</FieldError>
        </Field>

        <Field data-invalid={errors.about ? true : undefined}>
          <FieldLabel htmlFor="contact-about">Кто это</FieldLabel>
          <Input
            id="contact-about"
            name="about"
            defaultValue={values.about}
            maxLength={LIMITS.about}
            placeholder="Стоматолог, коллега, сосед по даче"
            autoComplete="off"
            aria-invalid={errors.about ? true : undefined}
            className="h-9"
          />
          <FieldError>{errors.about}</FieldError>
        </Field>

        <Field data-invalid={errors.howWeMet ? true : undefined}>
          <FieldLabel htmlFor="contact-how-we-met">Откуда знакомы</FieldLabel>
          <Input
            id="contact-how-we-met"
            name="howWeMet"
            defaultValue={values.howWeMet}
            maxLength={LIMITS.howWeMet}
            placeholder="Вместе учились, познакомились на конференции"
            autoComplete="off"
            aria-invalid={errors.howWeMet ? true : undefined}
            className="h-9"
          />
          <FieldError>{errors.howWeMet}</FieldError>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.phone ? true : undefined}>
            <FieldLabel htmlFor="contact-phone">Телефон</FieldLabel>
            <Input
              id="contact-phone"
              name="phone"
              type="tel"
              defaultValue={values.phone}
              maxLength={LIMITS.phone}
              placeholder="+7 900 000-00-00"
              autoComplete="off"
              aria-invalid={errors.phone ? true : undefined}
              className="h-9"
            />
            <FieldError>{errors.phone}</FieldError>
          </Field>

          <Field data-invalid={errors.email ? true : undefined}>
            <FieldLabel htmlFor="contact-email">Почта</FieldLabel>
            <Input
              id="contact-email"
              name="email"
              type="email"
              defaultValue={values.email}
              maxLength={LIMITS.email}
              placeholder="anna@example.com"
              autoComplete="off"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
              className="h-9"
            />
            <FieldError id="contact-email-error">{errors.email}</FieldError>
          </Field>
        </div>

        <Field data-invalid={errors.note ? true : undefined}>
          <FieldLabel htmlFor="contact-note">О чём договорились</FieldLabel>
          <Textarea
            id="contact-note"
            name="note"
            defaultValue={values.note}
            maxLength={LIMITS.note}
            placeholder="Созвониться в пятницу, прислать ссылку на книгу"
            aria-invalid={errors.note ? true : undefined}
            aria-describedby="contact-note-hint"
            className="max-h-40 min-h-20"
          />
          <FieldDescription id="contact-note-hint">
            Сохранится первой заметкой в карточке.
          </FieldDescription>
          <FieldError>{errors.note}</FieldError>
        </Field>
      </FieldGroup>

      {state.failed && (
        <p role="alert" className="text-sm text-destructive">
          Не получилось сохранить. Проверьте, что база данных запущена, и
          попробуйте ещё раз — введённое не потерялось.
        </p>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => contactsUi.closeAddDialog()}
        >
          Отмена
        </Button>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending && <Spinner aria-hidden />}
          {isPending ? "Сохраняем…" : "Добавить контакт"}
        </Button>
      </DialogFooter>
    </form>
  );
}
