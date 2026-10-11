import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { BROKERAGE, EMAIL, PHONE, SERVICE_AREA, SITE_NAME, SITE_URL, getRoute, pageMetadata } from "@/lib/siteRoutes";
import { USA_HUD_HOMES_BASE } from "@/lib/sisterSites";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const home = getRoute("/");

export const metadata: Metadata = {
  ...pageMetadata("/"),
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${home.title} | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  applicationName: SITE_NAME,
  authors: [{ name: "Marc Spencer", url: `${SITE_URL}/about` }],
  publisher: BROKERAGE,
  category: "Real Estate",
  keywords: [
    "Southeastern NC homes for sale",
    "Wilmington NC real estate",
    "Jacksonville NC homes",
    "HUD homes North Carolina",
    "HUD buyer's agent NC",
    "Camp Lejeune military relocation",
    "Topsail Beach homes",
    "Brunswick County NC homes",
    "Lightkeeper Realty",
  ],
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  alternates: {
    canonical: "/",
    types: { "text/markdown": "/llms.txt" },
  },
};

// Structured data (schema.org) — lets Google rich results and AI agents read
// who we are, where we work and how to reach us without scraping the page.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "RealEstateAgent",
      "@id": `${SITE_URL}/#business`,
      name: `${BROKERAGE} — ${SITE_NAME}`,
      alternateName: [SITE_NAME, BROKERAGE],
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/lightkeeper-logo.jpg`,
      image: `${SITE_URL}/lightkeeper-logo.jpg`,
      telephone: PHONE,
      email: EMAIL,
      priceRange: "$$",
      address: { "@type": "PostalAddress", addressRegion: "NC", addressCountry: "US" },
      areaServed: [
        ...SERVICE_AREA.map((name) => ({ "@type": "AdministrativeArea", name })),
        { "@type": "State", name: "North Carolina" },
      ],
      knowsAbout: [
        "HUD homes",
        "REO and foreclosure properties",
        "First-time home buyers",
        "VA loans and military relocation",
        "Coastal and waterfront real estate",
      ],
      founder: { "@id": `${SITE_URL}/#marc-spencer` },
      sameAs: [USA_HUD_HOMES_BASE],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: PHONE,
        email: EMAIL,
        contactType: "sales",
        areaServed: "US-NC",
        availableLanguage: "English",
      },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#marc-spencer`,
      name: "Marc Spencer",
      jobTitle: "CEO / Broker-in-Charge",
      image: `${SITE_URL}/marc-spencer.jpg`,
      url: `${SITE_URL}/about`,
      worksFor: { "@id": `${SITE_URL}/#business` },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      inLanguage: "en-US",
      publisher: { "@id": `${SITE_URL}/#business` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
