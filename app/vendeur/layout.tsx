"use client";

import { SellerFrame } from "@/components/seller/SellerFrame";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <SellerFrame>{children}</SellerFrame>;
}
