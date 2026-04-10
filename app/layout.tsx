import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://aievents.sg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AI Events SG",
    template: "%s · AI Events SG",
  },
  description:
    "Where Singapore's AI community comes together — hackathons, meetups, and builder events curated by 65labs.org.",
  openGraph: {
    title: "AI Events SG",
    description:
      "Discover AI hackathons, meetups, and community events in Singapore.",
    url: siteUrl,
    siteName: "AI Events SG",
    locale: "en_SG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Events SG",
    description:
      "Discover AI hackathons, meetups, and community events in Singapore.",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${figtree.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
