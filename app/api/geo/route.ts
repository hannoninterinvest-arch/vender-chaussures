import { NextRequest, NextResponse } from "next/server";

function clientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "";
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-client-ip") ||
    ""
  );
}

function headerCountry(req: NextRequest) {
  const raw =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-country-code") ||
    "";
  const code = raw.trim().toUpperCase();
  if (code && code !== "XX" && /^[A-Z]{2}$/.test(code)) return code;
  return "";
}

async function lookupIp(ip: string) {
  // TODO: si ipapi.co est limité, définir IPAPI_KEY et appeler https://ipapi.co/{ip}/json/?key=
  const key = process.env.IPAPI_KEY?.trim();
  const ipapiUrl = ip
    ? `https://ipapi.co/${encodeURIComponent(ip)}/json/${key ? `?key=${encodeURIComponent(key)}` : ""}`
    : "https://ipapi.co/json/";
  try {
    const res = await fetch(ipapiUrl, {
      cache: "no-store",
      headers: { "User-Agent": "elvaro-store/1.0" },
    });
    if (res.ok) {
      const data = (await res.json()) as { country_code?: string; error?: boolean };
      if (!data.error && data.country_code) {
        return data.country_code.toUpperCase();
      }
    }
  } catch {
    /* suite */
  }

  try {
    const target = ip ? `http://ip-api.com/json/${encodeURIComponent(ip)}` : "http://ip-api.com/json/";
    const res = await fetch(`${target}?fields=status,countryCode`, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { status?: string; countryCode?: string };
      if (data.status === "success" && data.countryCode) return data.countryCode.toUpperCase();
    }
  } catch {
    /* fallback TN */
  }
  return "";
}

export async function GET(req: NextRequest) {
  const fromHeader = headerCountry(req);
  if (fromHeader) {
    return NextResponse.json({ country: fromHeader, source: "header" });
  }
  const ip = clientIp(req);
  const looked = await lookupIp(ip);
  return NextResponse.json({
    country: looked || "TN",
    source: looked ? "ip" : "fallback",
  });
}
