import { faqItems } from "@/lib/site-content";

export function SiteFaq() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="border-t border-[color-mix(in_oklch,var(--muted)_55%,transparent)] px-4 pb-4 pt-10 sm:px-6 sm:pt-12 lg:px-10"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="faq-heading"
          className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-accent-secondary"
        >
          Questions
        </h2>
        <dl className="mt-6 space-y-8">
          {faqItems.map((item) => (
            <div key={item.id} id={`faq-${item.id}`}>
              <dt className="font-display text-base font-semibold text-foreground">
                {item.question}
              </dt>
              <dd className="mt-2 max-w-[62ch] text-sm leading-[1.75] text-foreground-muted">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
