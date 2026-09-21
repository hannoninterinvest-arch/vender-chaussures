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

export const metadata: Metadata = {
  title: "ELVARO by AIR GO SHOES — Cuir premium",
  description:
    "Chaussures haut de gamme fabriquées en Tunisie. Commande sans compte, paiement à la livraison.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" data-theme="light" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('elvaro-theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
