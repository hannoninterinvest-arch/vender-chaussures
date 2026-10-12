import { NextRequest, NextResponse } from "next/server";
import { CurrencyService } from "@/server/currency/currency.service";
import { ConfigService } from "@/server/config";
const currency = new CurrencyService(new ConfigService());
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  return NextResponse.json(
    await currency.quote(req.nextUrl.searchParams.get("country") || "TN"),
  );
}
