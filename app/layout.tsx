import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "KICKS — Do It Right | Boutique sneakers Tunisie",
  description:
    "Boutique de chaussures premium. Commande sans compte, paiement à la livraison partout en Tunisie.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${rubik.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
