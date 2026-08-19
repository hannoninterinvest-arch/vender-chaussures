"use client";

import { usePathname } from "next/navigation";
import { ToastProvider } from "./Toast";
import { WalkingTrail } from "./Footsteps";
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
          <div className="flex flex-1 flex-col pt-[var(--header-offset)]">
            <WalkingTrail />
            <main id="contenu" className="flex-1">
              {children}
            </main>
            <Footer />
            {!wholesale && <WhatsAppFab />}
          </div>
        </CatalogProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
