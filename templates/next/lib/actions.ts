"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale, LOCALE_COOKIE } from "@/config/locales";
import { signIn, signOut, signUp, type AuthResult } from "@/lib/auth";
import { safeNext } from "@/lib/redirect";

/*
 * Actions serveur appelées par les écrans. Elles renvoient `{ error }` au lieu de lever une
 * exception : en production, Next.js masque le message d'une exception.
 */

export async function signInAction(
  values: { email: string; password: string; remember: boolean },
  next: string | null,
): Promise<AuthResult> {
  const result = await signIn(values);
  if (result.error) return result;
  redirect(safeNext(next));
}

export async function signUpAction(values: {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}): Promise<AuthResult> {
  const result = await signUp(values);
  if (result.error) return result;
  redirect(safeNext(null));
}

export async function signOutAction() {
  await signOut();
  redirect("/connexion");
}

/** Mémorise la langue (un an). Une valeur inconnue est ignorée : la langue actuelle reste. */
export async function setLocaleAction(locale: string) {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
