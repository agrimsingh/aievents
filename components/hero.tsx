import { LabsLogoLink } from "@/components/labs-logo-link";

export function Hero() {
  return (
    <header className="relative overflow-hidden px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-10 lg:px-10">
      {/* Atmosphere — single subtle wash, not two competing blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[30%] -top-[60%] h-[500px] w-[700px] rounded-[50%] opacity-[0.15]"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.28 0.07 252 / 0.5), transparent 72%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Masthead row: title left, 65labs right */}
        <div className="animate-enter flex items-end justify-between gap-6 delay-1">
          <div>
            <h1 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.02em]">
              AI Events SG
            </h1>
            <p className="mt-1.5 text-[clamp(0.8125rem,1.4vw,0.9375rem)] leading-relaxed text-foreground-muted">
              Meetups, hackathons, and hands-on nights for people building with
              AI in Singapore.
            </p>
          </div>
          <LabsLogoLink
            className="mb-1 shrink-0 opacity-70 transition-opacity hover:opacity-100"
            imgClassName="h-5 w-auto sm:h-6"
          />
        </div>
      </div>
    </header>
  );
}
