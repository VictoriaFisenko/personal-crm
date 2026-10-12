import { useSyncExternalStore } from "react";

// Small client-side state shared by components that sit in different parts of
// the contacts page: the "add contact" dialog and the "just added" highlight.

type ContactsUiState = {
  addDialogOpen: boolean;
  // Name to prefill, e.g. when adding a person the search did not find.
  addDialogName: string;
  // Contact to scroll to once it shows up in the list.
  highlightId: number | null;
  // Contact whose row is flashing right now.
  flashId: number | null;
};

const initialState: ContactsUiState = {
  addDialogOpen: false,
  addDialogName: "",
  highlightId: null,
  flashId: null,
};

let state = initialState;
const listeners = new Set<() => void>();

function setState(patch: Partial<ContactsUiState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const contactsUi = {
  openAddDialog(name = "") {
    setState({ addDialogOpen: true, addDialogName: name });
  },
  closeAddDialog() {
    setState({ addDialogOpen: false });
  },
  // Ask the list to scroll to this contact as soon as it is there.
  highlight(id: number) {
    setState({ highlightId: id });
  },
  // The list has scrolled to the contact: flash its row.
  flash(id: number) {
    setState({ highlightId: null, flashId: id });
  },
  endFlash() {
    setState({ flashId: null });
  },
};

export function useContactsUi<T>(selector: (state: ContactsUiState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(initialState),
  );
}
