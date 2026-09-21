import { NextRequest, NextResponse } from "next/server";
import { normalizeCountry } from "@/lib/shipping";

const PRIVATE_IP =
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|::1|localhost|::ffff:127\.)/i;

function cleanIp(value?: string | null) {
  return (value || "").trim().replace(/^::ffff:/, "");
}

function clientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0];
  const realIp = req.headers.get("x-real-ip");
  return cleanIp(forwarded || realIp || "");
}

async function fromIpApiCo(ip: string) {
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: AbortSignal.timeout(2500),
      headers: { "User-Agent": "elvaro-storefront/1.0" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { country_code?: string; error?: boolean };
    if (data.error || !data.country_code) return null;
    return normalizeCountry(data.country_code);
  } catch {
    return null;
  }
}

async function fromIpApiCom(ip: string) {
  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode`,
      { signal: AbortSignal.timeout(2500) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { status?: string; countryCode?: string };
    if (data.status !== "success" || !data.countryCode) return null;
    return normalizeCountry(data.countryCode);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  if (!ip || PRIVATE_IP.test(ip)) {
    return NextResponse.json({ country: "TN", source: "default", reason: "local-or-private-ip" });
  }
  const lookedUp = (await fromIpApiCo(ip)) || (await fromIpApiCom(ip));
  return NextResponse.json({
    country: lookedUp || "TN",
    source: lookedUp ? "ip" : "default",
  });
}
