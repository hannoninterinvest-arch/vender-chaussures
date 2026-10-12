import { randomUUID } from "node:crypto";

const hints: Record<string, string> = {
  POSTGRES_DRIVER_MISSING:
    "Le pilote PostgreSQL ne peut pas être chargé : conserver typeorm et pg dans serverExternalPackages et redéployer.",
  DATABASE_URL_MISSING:
    "Définir DATABASE_URL dans Vercel pour cet environnement, puis redéployer.",
  DATABASE_URL_INVALID:
    "DATABASE_URL doit être une URL PostgreSQL complète, sans guillemets ajoutés.",
  JWT_SECRET_MISSING:
    "Définir JWT_SECRET dans Vercel pour cet environnement, puis redéployer.",
  "28P01":
    "Authentification PostgreSQL refusée : vérifier le mot de passe et l'utilisateur de DATABASE_URL.",
  "28000":
    "Accès PostgreSQL refusé : vérifier les identifiants et les règles d'accès.",
  "3D000": "La base PostgreSQL indiquée dans DATABASE_URL n'existe pas.",
  "42P01":
    "Table PostgreSQL manquante : vérifier la base ciblée et exécuter npm run db:init sur une base neuve.",
  "42703":
    "Colonne PostgreSQL manquante : le schéma de la base ne correspond pas au code déployé.",
  "42501":
    "Permissions PostgreSQL insuffisantes : vérifier les droits du rôle sur les tables et le schéma.",
  "53300": "Trop de connexions PostgreSQL : utiliser la connexion Neon pooler.",
  ECONNREFUSED:
    "Connexion PostgreSQL refusée : vérifier l'hôte et la disponibilité de la base.",
  ENOTFOUND: "Hôte introuvable : vérifier le nom de serveur dans DATABASE_URL.",
  EAI_AGAIN: "Résolution DNS temporairement indisponible.",
  ETIMEDOUT:
    "Connexion expirée : vérifier la disponibilité et l'accès réseau à la base.",
  ECONNRESET: "Connexion interrompue : vérifier la disponibilité de la base.",
  CERT_HAS_EXPIRED:
    "Certificat TLS expiré : vérifier le fournisseur de la base.",
  SELF_SIGNED_CERT_IN_CHAIN:
    "Certificat TLS non reconnu : vérifier la configuration SSL, sans désactiver sa validation.",
};

function classify(error: unknown, depth = 0): string | undefined {
  if (!error || typeof error !== "object" || depth > 4) return;
  const value = error as {
    message?: unknown;
    code?: unknown;
    driverError?: unknown;
    cause?: unknown;
    errors?: unknown[];
  };
  const configErrors: Record<string, string> = {
    'Postgres package has not been found installed. Please run "npm install pg".':
      "POSTGRES_DRIVER_MISSING",
    "DATABASE_URL est obligatoire": "DATABASE_URL_MISSING",
    "DATABASE_URL invalide": "DATABASE_URL_INVALID",
    "JWT_SECRET est obligatoire en production": "JWT_SECRET_MISSING",
  };
  if (typeof value.message === "string" && configErrors[value.message])
    return configErrors[value.message];
  if (typeof value.code === "string" && hints[value.code]) return value.code;
  if (
    typeof value.message === "string" &&
    /^(Connection terminated due to connection timeout|timeout exceeded when trying to connect)$/.test(
      value.message,
    )
  )
    return "ETIMEDOUT";
  for (const nested of [
    value.driverError,
    value.cause,
    ...(Array.isArray(value.errors) ? value.errors.slice(0, 5) : []),
  ]) {
    const code = classify(nested, depth + 1);
    if (code) return code;
  }
}

// Only log allowlisted diagnostics. Raw errors can contain SQL, customer data,
// connection URLs and payment keys, so never serialize the original exception.
export function reportServerError(
  error: unknown,
  method: string,
  route: string,
) {
  const errorId = randomUUID();
  const code = classify(error) || "UNEXPECTED_SERVER_ERROR";
  console.error("API request failed", {
    errorId,
    method,
    route,
    code,
    hint:
      hints[code] ||
      "Erreur non reconnue : reproduire en développement et examiner la configuration du service concerné.",
  });
  return errorId;
}
