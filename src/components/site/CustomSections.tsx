import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getCustomSectionsByPage } from "@/lib/content.functions";

type Row = {
  id: string;
  eyebrow: string | null;
  title: string;
  heading_level: number;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  image_position: "left" | "right" | "top" | "background" | "none";
  cta_label: string | null;
  cta_url: string | null;
  background_style: "default" | "muted" | "dark" | "gradient";
};

const bgClass: Record<Row["background_style"], string> = {
  default: "bg-background text-foreground",
  muted: "bg-secondary text-foreground",
  dark: "bg-ink text-white",
  gradient: "gradient-electric text-white",
};

export function CustomSections({ page }: { page: string }) {
  const fn = useServerFn(getCustomSectionsByPage);
  const { data } = useQuery({
    queryKey: ["custom-sections", page],
    queryFn: () => fn({ data: { page } }),
  });

  if (!data || data.length === 0) return null;

  return (
    <>
      {(data as Row[]).map((s) => (
        <SectionBlock key={s.id} s={s} />
      ))}
    </>
  );
}

function SectionBlock({ s }: { s: Row }) {
  const Heading = `h${s.heading_level}` as unknown as "h2";
  const isDark = s.background_style === "dark" || s.background_style === "gradient";
  const isBg = s.image_position === "background" && s.image_url;

  const headingCls = isDark
    ? "font-display font-bold text-3xl md:text-5xl text-white"
    : "font-display font-bold text-3xl md:text-5xl text-foreground";
  const subCls = isDark ? "mt-4 text-white/80 text-lg" : "mt-4 text-muted-foreground text-lg";
  const eyebrowCls = isDark
    ? "text-xs uppercase tracking-[0.3em] text-white/70"
    : "text-xs uppercase tracking-[0.3em] text-electric";
  const proseCls = isDark
    ? "prose prose-invert max-w-none mt-6"
    : "prose max-w-none mt-6 prose-headings:font-display";

  const content = (
    <div className="space-y-4">
      {s.eyebrow && <div className={eyebrowCls}>{s.eyebrow}</div>}
      <Heading className={headingCls}>{s.title}</Heading>
      {s.subtitle && <p className={subCls}>{s.subtitle}</p>}
      {s.body && (
        <div className={proseCls}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.body}</ReactMarkdown>
        </div>
      )}
      {s.cta_label && s.cta_url && (
        <a
          href={s.cta_url}
          className="inline-flex items-center mt-4 rounded-md bg-electric text-electric-foreground font-semibold px-5 py-3 hover:shadow-glow"
        >
          {s.cta_label}
        </a>
      )}
    </div>
  );

  if (isBg) {
    return (
      <section className="relative py-24 overflow-hidden">
        <img src={s.image_url!} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="relative max-w-5xl mx-auto px-6 text-white">
          <div className="[&_*]:!text-white">{content}</div>
        </div>
      </section>
    );
  }

  if (s.image_position === "top" && s.image_url) {
    return (
      <section className={`py-20 ${bgClass[s.background_style]}`}>
        <div className="max-w-5xl mx-auto px-6">
          <img
            src={s.image_url}
            alt=""
            className="w-full h-72 md:h-96 object-cover rounded-2xl mb-10"
          />
          {content}
        </div>
      </section>
    );
  }

  if ((s.image_position === "left" || s.image_position === "right") && s.image_url) {
    return (
      <section className={`py-20 ${bgClass[s.background_style]}`}>
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          {s.image_position === "left" && (
            <img
              src={s.image_url}
              alt=""
              className="w-full h-80 md:h-[28rem] object-cover rounded-2xl"
            />
          )}
          <div>{content}</div>
          {s.image_position === "right" && (
            <img
              src={s.image_url}
              alt=""
              className="w-full h-80 md:h-[28rem] object-cover rounded-2xl"
            />
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={`py-20 ${bgClass[s.background_style]}`}>
      <div className="max-w-4xl mx-auto px-6 text-center">{content}</div>
    </section>
  );
}
