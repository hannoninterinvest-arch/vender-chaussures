import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";
import { currencyForCountry, FALLBACK_RATES_FROM_TND } from "@/lib/countries";

export async function GET(req: NextRequest) {
  const country = (req.nextUrl.searchParams.get("country") || "TN").toUpperCase();

  try {
    const res = await fetch(apiUrl(`/currency?country=${encodeURIComponent(country)}`), {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.currency && typeof data.rateFromTnd === "number") {
        return NextResponse.json(data);
      }
    }
  } catch {
    /* API Nest pas encore déployée : on continue en local */
  }

  try {
    // TODO: EXCHANGE_RATE_API_KEY pour https://v6.exchangerate-api.com/v6/{key}/latest/TND
    const key = process.env.EXCHANGE_RATE_API_KEY?.trim();
    const url = key
      ? `https://v6.exchangerate-api.com/v6/${encodeURIComponent(key)}/latest/TND`
      : "https://open.er-api.com/v6/latest/TND";
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as {
        conversion_rates?: Record<string, number>;
        rates?: Record<string, number>;
      };
      const rates = data.conversion_rates || data.rates || {};
      const currency = currencyForCountry(country);
      const rateFromTnd = rates[currency] ?? FALLBACK_RATES_FROM_TND[currency] ?? 1;
      return NextResponse.json({
        country,
        currency,
        rateFromTnd,
        source: key ? "exchangerate-api" : "open.er-api",
        catalogCurrency: "TND",
      });
    }
  } catch {
    /* repli */
  }

  const currency = currencyForCountry(country);
  return NextResponse.json({
    country,
    currency,
    rateFromTnd: FALLBACK_RATES_FROM_TND[currency] ?? 1,
    source: "fallback",
    catalogCurrency: "TND",
  });
}
