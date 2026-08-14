"use client";

import { ToastProvider } from "./Toast";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </ToastProvider>
  );
}
