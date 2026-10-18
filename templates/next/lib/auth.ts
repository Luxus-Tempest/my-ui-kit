/**
 * Authentification : le seul fichier qui connaît le fournisseur.
 *
 * Les pages, les actions et la coque n'appellent que les fonctions exportées ici. Pour brancher
 * ton fournisseur (Auth.js, Clerk, Supabase, Better Auth, ton API…), remplace le contenu de
 * `getSession`, `signIn`, `signUp` et `signOut`, et garde leurs signatures : rien d'autre ne change.
 *
 * Par défaut, un adaptateur de démonstration accepte toute adresse valide et un mot de passe
 * d'au moins 8 caractères. Il refuse de fonctionner en production, sauf avec `AUTH_DEMO=true`.
 */
import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { authDemoAllowed, isProduction } from "@/lib/env";

export interface Session {
  user: { id: string; name: string; email: string; role: string };
}

/** Résultat d'une connexion ou d'une inscription : une erreur à afficher, ou rien (succès). */
export type AuthResult = { error?: string };

const SESSION_COOKIE = "session";
const WEEK = 60 * 60 * 24 * 7;
const NOT_CONFIGURED = "Branche ton fournisseur d'authentification dans lib/auth.ts.";

/** Démo active en production : la coque affiche un bandeau. */
export function isDemoInProduction() {
  return isProduction() && authDemoAllowed();
}

function demoRefused() {
  return isProduction() && !authDemoAllowed();
}

function encode(session: Session) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decode(value: string): Session | null {
  try {
    const session = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Session;
    return session?.user?.email ? session : null;
  } catch {
    return null;
  }
}

async function writeSession(session: Session, remember: boolean) {
  (await cookies()).set(SESSION_COOKIE, encode(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    ...(remember ? { maxAge: WEEK } : {}),
  });
}

function demoUser(email: string, name?: string): Session["user"] {
  const local = email.split("@")[0] ?? email;
  return {
    id: createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 16),
    name: name?.trim() || local.charAt(0).toUpperCase() + local.slice(1),
    email,
    role: "Membre",
  };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Session de la requête, ou `null`. */
export async function getSession(): Promise<Session | null> {
  if (demoRefused()) return null;
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return value ? decode(value) : null;
}

/**
 * Session obligatoire : sans elle, redirige vers la connexion avec la page demandée en retour.
 * À appeler dans chaque page et action protégée (le layout seul ne suffit pas).
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (session) return session;
  const path = (await headers()).get("x-pathname") ?? "/";
  redirect(`/connexion?suivant=${encodeURIComponent(path)}`);
}

export async function signIn(values: { email: string; password: string; remember: boolean }): Promise<AuthResult> {
  if (demoRefused()) return { error: NOT_CONFIGURED };
  if (!EMAIL.test(values.email) || values.password.length < 8) {
    return { error: "Adresse ou mot de passe incorrect." };
  }
  await writeSession({ user: demoUser(values.email) }, values.remember);
  return {};
}

export async function signUp(values: {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}): Promise<AuthResult> {
  if (demoRefused()) return { error: NOT_CONFIGURED };
  if (!values.acceptTerms) return { error: "Accepte les conditions d'utilisation pour créer ton compte." };
  if (!EMAIL.test(values.email)) return { error: "Adresse e-mail invalide." };
  if (values.password.length < 8) return { error: "Le mot de passe doit compter au moins 8 caractères." };
  await writeSession({ user: demoUser(values.email, values.name) }, true);
  return {};
}

export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE);
}
