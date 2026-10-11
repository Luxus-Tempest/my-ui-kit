"use server";

import { redirect } from "next/navigation";

export interface InvitationState {
  ok: boolean;
  /** Incrémenté à chaque invitation réussie : le client sait qu'il doit fermer le dialogue. */
  envoi: number;
  message?: string;
  erreurs?: { email?: string; role?: string };
}

const ROLES = ["admin", "editeur", "lecteur"];

/** Server action : les champs de la librairie postent leurs valeurs par leur `name`, comme des champs natifs. */
export async function inviter(precedent: InvitationState, formData: FormData): Promise<InvitationState> {
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  const erreurs: NonNullable<InvitationState["erreurs"]> = {};
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) erreurs.email = "Saisissez une adresse e-mail valide.";
  if (!ROLES.includes(role)) erreurs.role = "Choisissez un rôle.";
  if (erreurs.email || erreurs.role) return { ok: false, envoi: precedent.envoi, erreurs };

  await new Promise((resolve) => setTimeout(resolve, 500)); // l'envoi du courriel
  return { ok: true, envoi: precedent.envoi + 1, message: `Invitation envoyée à ${email}` };
}

export async function connexion(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  if (!email) return;
  redirect("/");
}
