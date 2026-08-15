"use client";

import { usePathname } from "next/navigation";
import { ToastProvider } from "./Toast";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CatalogProvider } from "@/lib/catalog";

export function Providers({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const seller = path.startsWith("/vendeur");

  if (seller) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ToastProvider>
      <CatalogProvider>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </CatalogProvider>
    </ToastProvider>
  );
}
