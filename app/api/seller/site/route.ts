import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";
import { defaultSite } from "@/lib/site";

function authHeaders(req: Request): HeadersInit {
  const authorization = req.headers.get("authorization") || "";
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(authorization ? { Authorization: authorization } : {}),
  };
}

export async function GET(req: Request) {
  try {
    const res = await fetch(apiUrl("/seller/site"), {
      cache: "no-store",
      headers: authHeaders(req),
    });
    if (res.ok) return NextResponse.json(await res.json());
    if (res.status === 401 || res.status === 403) {
      const err = await res.json().catch(() => ({ message: "Non autorisé" }));
      return NextResponse.json(err, { status: res.status });
    }
  } catch {
    /* API Render pas encore à jour */
  }
  return NextResponse.json(defaultSite);
}

export async function PATCH(req: Request) {
  const body = await req.text();
  try {
    const res = await fetch(apiUrl("/seller/site"), {
      method: "PATCH",
      headers: authHeaders(req),
      body,
    });
    if (res.status === 404) {
      return NextResponse.json(
        {
          message:
            "L’API Render n’a pas encore cette route. Merge la PR ELVARO puis Manual Deploy sur Render.",
        },
        { status: 503 },
      );
    }
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "API indisponible" }, { status: 503 });
  }
}
