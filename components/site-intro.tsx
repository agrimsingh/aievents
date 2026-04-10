import { siteIntroParagraphs } from "@/lib/site-content";

export function SiteIntro() {
  return (
    <section
      aria-labelledby="site-intro-heading"
      className="border-t border-[color-mix(in_oklch,var(--muted)_55%,transparent)] px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-12 lg:px-10"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="site-intro-heading"
          className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-accent-secondary"
        >
          What this is
        </h2>
        <div className="mt-4 max-w-[62ch] space-y-4 text-sm leading-[1.75] text-foreground-muted">
          {siteIntroParagraphs.map((block, i) => (
            <p key={i}>{block}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
