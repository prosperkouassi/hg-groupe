import type { Metadata } from "next";
import {
  Manrope,
  Newsreader,
} from "next/font/google";

import "./globals.css";

import SiteChrome from "@/components/SiteChrome";
import { publicRecruitmentEnabled } from "@/modules/recrutement/public-visibility";

const siteUrl = "https://hoplagroupe.com";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Hopla Groupe | Digital, Organisation & Développement",
    template: "%s | Hopla Groupe",
  },

  description:
    "Hopla Groupe accompagne les entreprises en Côte d’Ivoire dans leur transformation digitale, leur organisation, leurs ressources humaines et leurs projets.",

  applicationName: "Hopla Groupe",

  authors: [
    {
      name: "Hopla Groupe",
      url: siteUrl,
    },
  ],

  creator: "Hopla Groupe",
  publisher: "Hopla Groupe",

  category: "Conseil et transformation des entreprises",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "fr_CI",
    url: siteUrl,
    siteName: "Hopla Groupe",

    title: "Hopla Groupe | Digital, Organisation & Développement",

    description:
      "Hopla Groupe accompagne les entreprises en Côte d’Ivoire dans leur transformation digitale, leur organisation, leurs ressources humaines et leurs projets.",

    images: [
      {
        url: "/images/og-hopla-groupe.jpg",
        width: 1200,
        height: 630,
        alt: "Hopla Groupe — Digital, Organisation & Développement",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Hopla Groupe | Digital, Organisation, RH & Projets",

    description:
      "Digital, organisation, ressources humaines et gestion de projet : deux expertises complémentaires pour accompagner le développement des entreprises.",

    images: ["/images/og-hopla-groupe.jpg"],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

/* =========================================================
   DONNÉES STRUCTURÉES — ORGANIZATION
========================================================= */

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",

  "@id": `${siteUrl}/#organization`,

  name: "Hopla Groupe",

  url: siteUrl,

  logo: {
    "@type": "ImageObject",
    url: `${siteUrl}/images/hopla-groupe.png`,
  },

  image: `${siteUrl}/images/og-hopla-groupe.jpg`,

  description:
    "Hopla Groupe accompagne les entreprises en Côte d’Ivoire dans leur transformation digitale, leur organisation, leurs ressources humaines et leurs projets.",

  areaServed: {
    "@type": "Country",
    name: "Côte d’Ivoire",
  },

  knowsAbout: [
    "Transformation digitale",
    "Sites web",
    "Applications",
    "Logiciels métiers",
    "Organisation d'entreprise",
    "Ressources humaines",
    "Management",
    "Gestion de projet",
    "Transformation organisationnelle",
  ],

  department: [
    {
      "@type": "Organization",

      name: "AlteractWeb",

      url: "https://alteractweb.com",

      description:
        "Pôle Digital & Technologie de Hopla Groupe, spécialisé dans la conception de solutions digitales, sites web, applications et logiciels métiers.",

      parentOrganization: {
        "@id": `${siteUrl}/#organization`,
      },
    },

    {
      "@type": "Organization",

      name: "Stratège Action",

      url: "https://strategaction.com",

      description:
        "Pôle Organisation & Développement de Hopla Groupe, spécialisé dans l’organisation, les ressources humaines et la gestion de projet.",

      parentOrganization: {
        "@id": `${siteUrl}/#organization`,
      },
    },
  ],
};

/* =========================================================
   DONNÉES STRUCTURÉES — WEBSITE
========================================================= */

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",

  "@id": `${siteUrl}/#website`,

  url: siteUrl,

  name: "Hopla Groupe",

  description:
    "Digital, organisation, ressources humaines et gestion de projet au service du développement des entreprises.",

  inLanguage: "fr-CI",

  publisher: {
    "@id": `${siteUrl}/#organization`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
    >
      <body
        className={`${manrope.variable} ${newsreader.variable}`}
      >
        {/* =====================================================
            DONNÉES STRUCTURÉES
        ====================================================== */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              organizationSchema
            ).replace(
              /</g,
              "\\u003c"
            ),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              websiteSchema
            ).replace(
              /</g,
              "\\u003c"
            ),
          }}
        />

        {/* =====================================================
            SITE
        ====================================================== */}

        <SiteChrome showRecruitment={publicRecruitmentEnabled()}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
