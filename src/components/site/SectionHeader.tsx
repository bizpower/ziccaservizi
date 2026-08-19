interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeader({ eyebrow, title, description, align = "left" }: Props) {
  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 mb-5">
          <span className="h-px w-8 bg-electric" />
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-electric">{eyebrow}</span>
        </div>
      )}
      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed text-balance">{description}</p>
      )}
    </div>
  );
}
