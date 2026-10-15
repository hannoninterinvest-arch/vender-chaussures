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
  "23503":
    "Contrainte de clé étrangère PostgreSQL : une autre table de la base partagée référence cette ligne.",
  "23505": "Contrainte d'unicité PostgreSQL violée : la valeur existe déjà.",
  "23502":
    "Colonne PostgreSQL obligatoire non renseignée : lui donner une valeur par défaut ou la renseigner dans le code.",
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
    "JWT_SECRET doit contenir au moins 32 octets.": "JWT_SECRET_MISSING",
  };
  if (typeof value.message === "string" && configErrors[value.message])
    return configErrors[value.message];
  if (
    typeof value.message === "string" &&
    /^JWT_SECRET (est obligatoire|doit contenir)/.test(value.message)
  )
    return "JWT_SECRET_MISSING";
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

// PostgreSQL names the absent column or table in the message. Only a strict
// identifier is logged, never the rest of the message (which may echo SQL).
function missingObject(error: unknown, depth = 0): string | undefined {
  if (!error || typeof error !== "object" || depth > 4) return;
  const value = error as { message?: unknown; driverError?: unknown; cause?: unknown };
  if (typeof value.message === "string") {
    const match = /^(column|relation) "?([A-Za-z0-9_.]{1,80})"? does not exist/.exec(value.message);
    if (match) return `${match[1]} ${match[2]}`;
  }
  return missingObject(value.driverError, depth + 1) ?? missingObject(value.cause, depth + 1);
}

// Constraint and table names are schema identifiers, not data; values are never read.
function constraintInfo(error: unknown, depth = 0): { constraint?: string; table?: string } | undefined {
  if (!error || typeof error !== "object" || depth > 4) return;
  const value = error as { constraint?: unknown; table?: unknown; driverError?: unknown; cause?: unknown };
  const identifier = /^[A-Za-z0-9_.]{1,80}$/;
  const constraint = typeof value.constraint === "string" && identifier.test(value.constraint) ? value.constraint : undefined;
  const table = typeof value.table === "string" && identifier.test(value.table) ? value.table : undefined;
  if (constraint || table) return { constraint, table };
  return constraintInfo(value.driverError, depth + 1) ?? constraintInfo(value.cause, depth + 1);
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
  const missing = code === "42703" || code === "42P01" ? missingObject(error) : undefined;
  console.error("API request failed", {
    errorId,
    method,
    route,
    code,
    ...(missing ? { missing } : {}),
    ...(/^23\d{3}$/.test(code) ? constraintInfo(error) : {}),
    hint:
      hints[code] ||
      "Erreur non reconnue : reproduire en développement et examiner la configuration du service concerné.",
  });
  return errorId;
}
