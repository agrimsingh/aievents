import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { SITE_URL, siteSummary } from "@/lib/site-content";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AI Events SG",
    template: "%s · AI Events SG",
  },
  description: siteSummary,
  keywords: [
    "Singapore AI events",
    "AI meetup Singapore",
    "AI hackathon Singapore",
    "machine learning Singapore",
    "AI builders Singapore",
    "Luma events Singapore",
    "65labs",
    "AI workshop Singapore",
  ],
  openGraph: {
    title: "AI Events SG",
    description: siteSummary,
    url: SITE_URL,
    siteName: "AI Events SG",
    locale: "en_SG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Events SG",
    description: siteSummary,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-SG"
      className={`${bricolage.variable} ${figtree.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
