import type { Metadata } from "next";
import { titleFor } from "@/config/navigation";
import { requireSession } from "@/lib/auth";
import { Dashboard } from "./dashboard";

export const metadata: Metadata = { title: titleFor("/tableau-de-bord") };

export default async function TableauDeBordPage() {
  await requireSession();
  return <Dashboard />;
}
