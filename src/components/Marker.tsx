import { SECTIONS, sectionIndex, type SectionId } from "@/lib/sections";

/** Section label: index, name and a hairline. */
export default function Marker({ id, note }: { id: SectionId; note?: string }) {
  const label = SECTIONS.find((s) => s.id === id)!.label;
  return (
    <p className="marker" data-reveal>
      <b>{sectionIndex(id)}</b>
      <span>{label}</span>
      {note && <span>{note}</span>}
    </p>
  );
}
