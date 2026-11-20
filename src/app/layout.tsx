// biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD is generated from local static metadata.
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/styles.scss";
import { Header } from "@/components/layout/Header";
import { siteDescription as description, personSchema } from "@/lib/seo/site";

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-jost",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arinaholic.me"),
  title: {
    default: "sagittarius",
    template: "%s · sagittarius",
  },
  description,
  applicationName: "sagittarius",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "sagittarius",
    title: "sagittarius — drivers, terminals & small simulations.",
    description,
    url: "https://arinaholic.me/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "sagittarius — drivers, terminals & small simulations.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "sagittarius — drivers, terminals & small simulations.",
    description,
    images: ["/og-image.png"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f7f4ec",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jost.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <Header />
        {children}
        {process.env.VERCEL ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
