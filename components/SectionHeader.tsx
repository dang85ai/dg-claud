export function SectionHeader({
  eyebrow,
  title,
  copy
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="mb-8">
      <div className="kicker">{eyebrow}</div>
      <h2 className="section-title mt-4">{title}</h2>
      {copy ? <p className="max-w-3xl text-base text-neutral-600 md:text-lg">{copy}</p> : null}
    </div>
  );
}
