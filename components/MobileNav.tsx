import Link from "next/link";
import { CalendarDays, Home, Menu, Shield, Users } from "lucide-react";

export function MobileNav() {
  const links = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/schedule", label: "Schedule", Icon: CalendarDays },
    { href: "/roster", label: "Team", Icon: Users },
    { href: "/login", label: "Portal", Icon: Shield },
    { href: "/contact", label: "More", Icon: Menu }
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Quick mobile navigation">
      {links.map(({ href, label, Icon }) => (
        <Link key={href} href={href}>
          <span className="grid place-items-center gap-1">
            <Icon size={19} aria-hidden="true" />
            {label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
