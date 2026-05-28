import type { Metadata } from "next";
import { Cormorant_SC, Spectral } from "next/font/google";
import { AtmosphericBackdrop } from "@/components/layout/atmospheric-backdrop";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { AppProviders } from "@/context/providers";
import { siteConfig } from "@/config/site";
import "@/app/globals.css";

const display = Cormorant_SC({
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap"
});

const body = Spectral({
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Thư viện game Visual Novel`,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [{ url: "/backgrounds/eden-cathedral.png", width: 2048, height: 819 }],
    locale: "vi_VN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/backgrounds/eden-cathedral.png"]
  },
  icons: {
    icon: "/logos/edenverse-mark.svg",
    shortcut: "/logos/edenverse-mark.svg",
    apple: "/logos/edenverse-mark.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${display.variable} ${body.variable}`}>
        <AppProviders>
          <AtmosphericBackdrop />
          <div className="relative z-10 min-h-screen">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
