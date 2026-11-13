export function SectionHeader({
  eyebrow,
  title,
  copy,
  tone = "light"
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className="mb-8">
      <div className="kicker">{eyebrow}</div>
      <h2 className="section-title mt-4">{title}</h2>
      {copy ? <p className={`max-w-3xl text-base md:text-lg ${tone === "dark" ? "text-neutral-300" : "text-neutral-600"}`}>{copy}</p> : null}
    </div>
  );
}

