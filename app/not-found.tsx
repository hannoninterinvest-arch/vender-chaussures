import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-6 py-24 text-center">
      <p className="font-[family-name:var(--font-display)] text-6xl tracking-[0.2em] text-[#C5A059]">
        404
      </p>
      <p className="mt-3 text-[#EDE8DE]/65">Cette page n’existe pas.</p>
      <Link href="/" className="gold-btn mt-8 inline-flex rounded-sm px-6 py-3 text-xs uppercase">
        Retour à l’accueil
      </Link>
    </div>
  );
}
