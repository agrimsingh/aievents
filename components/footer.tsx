import { LabsLogoLink } from "@/components/labs-logo-link";

export function Footer() {
  return (
    <footer className="mt-20 px-4 pb-12 pt-16 sm:mt-24 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div
          aria-hidden
          className="mb-12 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--muted), transparent)",
          }}
        />

        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <p className="font-display text-lg font-semibold leading-snug">
              AI Events SG
            </p>
            <p className="mt-3 text-sm leading-[1.7] text-foreground-muted">
              A loose calendar for Singapore builders who mess with models,
              APIs, and the messy stuff in between.
              <br />
              Built by{" "}
              <LabsLogoLink
                className="mx-0.5 inline-flex translate-y-[0.08em]"
                imgClassName="h-[1.125rem] w-auto sm:h-5"
              />
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-foreground-muted">
              Contribute
            </span>
            <p className="max-w-[28ch] text-foreground-muted">
              Want your event here?{" "}
              <span className="text-foreground">
                Submissions opening up later.
              </span>
            </p>
          </div>
        </div>

        <p className="mt-16 text-xs leading-relaxed text-foreground-muted/60">
          Data comes from Luma pages we track. Confirm time and place on the
          official listing before you leave the house.
        </p>
      </div>
    </footer>
  );
}
