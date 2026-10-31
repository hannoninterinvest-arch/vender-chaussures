import { headers } from "next/headers";
import type { Metadata } from "next";
import { Cinzel, Montserrat } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const display = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const socialTitle = "ELVARO COLLECTION +";
const socialDescription =
  "Découvrez ELVARO COLLECTION + : chaussures premium pour femme et homme, créations élégantes et savoir-faire tunisien.";

export const metadata: Metadata = {
  metadataBase: new URL("https://elvaroco.com"),
  title: socialTitle,
  description: socialDescription,
  applicationName: "ELVARO COLLECTION +",
  openGraph: {
    title: socialTitle,
    description: socialDescription,
    siteName: "ELVARO COLLECTION +",
    locale: "fr_TN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: socialDescription,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="fr" data-theme="light" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('elvaro-theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
