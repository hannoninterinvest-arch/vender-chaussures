import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-6 py-24 text-center">
      <p className="text-4xl font-black">404</p>
      <p className="mt-2 text-[#666]">Cette page n’existe pas.</p>
      <Link href="/" className="mt-6 inline-block text-[#5B6AF6] underline">
        Retour à l’accueil
      </Link>
    </div>
  );
}
