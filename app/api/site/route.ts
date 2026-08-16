import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";
import { defaultSite } from "@/lib/site";

export async function GET() {
  try {
    const res = await fetch(apiUrl("/site"), { cache: "no-store" });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {
    /* API Render pas encore à jour */
  }
  return NextResponse.json(defaultSite);
}
