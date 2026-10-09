export function SectionHeading({ id, children, aside }: { id: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 md:mb-10">
      <h2 id={id} className="font-display text-heading font-bold">
        {children}
      </h2>
      {aside}
    </div>
  );
}
