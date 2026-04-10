import Image from "next/image";

const LABS_URL = "https://65labs.org";

type LabsLogoLinkProps = {
  className?: string;
  /** Tailwind height classes; width stays auto from aspect ratio */
  imgClassName?: string;
};

export function LabsLogoLink({
  className,
  imgClassName = "h-[1.125rem] w-auto sm:h-5",
}: LabsLogoLinkProps) {
  return (
    <a
      href={LABS_URL}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center align-middle transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className ?? ""}`}
    >
      <Image
        src="/65labs.png"
        alt="65labs"
        width={120}
        height={36}
        className={imgClassName}
        sizes="120px"
      />
    </a>
  );
}
