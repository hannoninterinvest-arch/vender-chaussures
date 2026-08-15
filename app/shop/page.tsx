import { Suspense } from "react";
import { ShopClient } from "./ShopClient";

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-20 text-center text-sm text-[#EDE8DE]/60">Chargement…</div>
      }
    >
      <ShopClient />
    </Suspense>
  );
}
