export function LegalArticle({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro?: string;
  sections: { heading: string; body: string[] }[];
}) {
  return (
    <article className="mx-auto max-w-3xl px-5 pt-32 pb-24 sm:px-6">
      <p className="text-sm font-semibold tracking-wide text-accent uppercase">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{updated}</p>
      {intro ? <p className="mt-8 text-base leading-relaxed text-foreground/90">{intro}</p> : null}
      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-xl font-semibold tracking-tight">{section.heading}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/80">
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 64)}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
