import type { Metadata } from "next";
import { titleFor } from "@/config/navigation";
import { requireSession } from "@/lib/auth";
import { Settings } from "./settings";

export const metadata: Metadata = { title: titleFor("/parametres") };

export default async function ParametresPage() {
  const session = await requireSession();
  return <Settings user={session.user} />;
}
