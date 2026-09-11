// Mirrors the web app's components/maps/activeAutocomplete.ts — module-level
// (not React context) so it works across sibling instances regardless of
// where each LocationField sits in the tree (pickup/drop-off rows in the same
// form are the common case). Only one instance's suggestion list may be open
// at a time; activating one closes every other.
type Listener = (activeId: string | null) => void;

let activeId: string | null = null;
const listeners = new Set<Listener>();

export function setActiveAutocomplete(id: string | null): void {
  activeId = id;
  listeners.forEach((fn) => fn(activeId));
}

export function subscribeActiveAutocomplete(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
