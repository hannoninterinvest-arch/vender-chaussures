"use client";

import { ToastProvider } from "./Toast";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CatalogProvider } from "@/lib/catalog";

export function Providers({ children }: { children: React.ReactNode }) {
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
