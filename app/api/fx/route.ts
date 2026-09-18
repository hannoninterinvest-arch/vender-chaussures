import { NextResponse } from "next/server";

export const revalidate = 21600;

export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/TND", {
      next: { revalidate: 21600 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
      time_last_update_utc?: string;
    };
    if (data.result !== "success" || !data.rates) {
      throw new Error("réponse FX invalide");
    }
    const rates: Record<string, number> = { TND: 1 };
    for (const [code, value] of Object.entries(data.rates)) {
      if (Number.isFinite(value) && value > 0) rates[code] = value;
    }
    return NextResponse.json({
      available: true,
      base: "TND",
      rates,
      fetchedAt: data.time_last_update_utc || new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      available: false,
      base: "TND",
      rates: { TND: 1 },
      fetchedAt: null,
    });
  }
}
