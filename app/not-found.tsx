import Link from "next/link";
import { BrandMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="px-6 py-24 text-center">
      <BrandMark size="lg" className="mx-auto" />
      <p className="mt-8 font-[family-name:var(--font-display)] text-6xl tracking-[0.2em] text-[var(--gold)]">
        404
      </p>
      <p className="mt-3 text-[var(--muted)]">Cette page n’existe pas.</p>
      <Link href="/" className="gold-btn mt-8 inline-flex rounded-sm px-6 py-3 text-xs uppercase">
        Retour à l’accueil
      </Link>
    </div>
  );
}
