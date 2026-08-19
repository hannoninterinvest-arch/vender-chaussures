"use client";

import { usePathname } from "next/navigation";
import { ToastProvider } from "./Toast";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppFab } from "./Experience";
import { CatalogProvider } from "@/lib/catalog";
import { ThemeProvider } from "@/lib/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const seller = path.startsWith("/vendeur");
  /* L'espace grossistes se traite par le formulaire du site, pas par WhatsApp. */
  const wholesale = path.startsWith("/grossiste");

  if (seller) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <CatalogProvider>
          <Header />
          <main id="contenu" className="flex-1 pt-[var(--header-h)]">
            {children}
          </main>
          <Footer />
          {!wholesale && <WhatsAppFab />}
        </CatalogProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
