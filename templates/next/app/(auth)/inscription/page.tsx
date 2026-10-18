import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { HOME_AFTER_SIGN_IN } from "@/lib/redirect";
import { InscriptionForm } from "./inscription-form";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function InscriptionPage() {
  if (await getSession()) redirect(HOME_AFTER_SIGN_IN);
  return <InscriptionForm />;
}
