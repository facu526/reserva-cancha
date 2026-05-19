import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getSiteSettings } from "@/lib/site-settings";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: `${settings.site_name} | ${settings.club_name}`,
    description: settings.hero_subtitle,
    icons: settings.favicon_url ? { icon: settings.favicon_url } : undefined
  };
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
