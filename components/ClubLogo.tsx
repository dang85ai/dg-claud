import Image from "next/image";
export function ClubLogo({ className = "h-12 w-12", decorative = false }: { className?: string; decorative?: boolean }) {
  return <Image src="/images/caledon-united-logo.webp" alt={decorative ? "" : "Caledon United Football Club crest"} width={500} height={500} className={"shrink-0 rounded-full object-contain " + className} />;
}
