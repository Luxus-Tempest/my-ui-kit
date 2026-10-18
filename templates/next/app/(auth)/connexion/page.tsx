import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { safeNext } from "@/lib/redirect";
import { ConnexionForm } from "./connexion-form";

export const metadata: Metadata = { title: "Connexion" };

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ suivant?: string | string[] }>;
}) {
  const { suivant } = await searchParams;
  const next = typeof suivant === "string" ? suivant : null;
  // Déjà connecté : directement à la page demandée.
  if (await getSession()) redirect(safeNext(next));
  return <ConnexionForm next={next} />;
}
