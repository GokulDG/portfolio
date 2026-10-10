/** Page order. Drives the navigation, the progress rail and section markers. */
export const SECTIONS = [
  { id: "top", label: "Opening", nav: false },
  { id: "story", label: "Story", nav: false },
  { id: "work", label: "Work", nav: true },
  { id: "systems", label: "Systems", nav: true },
  { id: "toolkit", label: "Toolkit", nav: true },
  { id: "process", label: "Process", nav: false },
  { id: "journey", label: "Journey", nav: true },
  { id: "contact", label: "Contact", nav: true },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export const sectionIndex = (id: SectionId) =>
  String(SECTIONS.findIndex((s) => s.id === id) + 1).padStart(2, "0");
