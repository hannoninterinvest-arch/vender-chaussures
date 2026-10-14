import { ServiceUnavailableException } from "@/server/http";
import type { ConfigService } from "@/server/config";

// Public base URL used for payment redirects and provider callbacks.
export function appUrl(config: ConfigService) {
  const explicit = config.get<string>("APP_URL")?.trim();
  const production = config.get("NODE_ENV") === "production";
  if (!explicit) {
    if (production) {
      throw new ServiceUnavailableException(
        "APP_URL est obligatoire pour les paiements.",
      );
    }
    return "http://localhost:3000";
  }
  let url: URL;
  try {
    url = new URL(explicit);
  } catch {
    throw new ServiceUnavailableException("APP_URL est invalide.");
  }
  if (production && url.protocol !== "https:") {
    throw new ServiceUnavailableException(
      "APP_URL doit utiliser HTTPS en production.",
    );
  }
  return url.origin + url.pathname.replace(/\/$/, "");
}
