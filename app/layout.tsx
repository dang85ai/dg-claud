import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Caledon Soccer Club U9 Girls 2026",
    template: "%s | Caledon U9 Girls"
  },
  description: "Official 2026 team hub for the Caledon Soccer Club U9 Girls.",
  applicationName: "Caledon U9 Girls 2026",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
