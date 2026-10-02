import Image from "next/image";
export function ClubLogo({ className = "h-12 w-12", decorative = false }: { className?: string; decorative?: boolean }) {
  return <Image src="/images/club-logo.webp" alt={decorative ? "" : "Caledon Soccer Club crest"} width={1600} height={1600} className={"shrink-0 rounded-full object-contain " + className} />;
}
