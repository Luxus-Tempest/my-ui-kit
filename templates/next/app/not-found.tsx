import Link from "next/link";
import { Button, EmptyState } from "@rovia/ui";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <main id="contenu" tabIndex={-1} className="grid min-h-svh place-items-center px-6 outline-none">
      <EmptyState
        // Titre de page : plus grand que l'état vide par défaut.
        className="[&_h1]:text-2xl"
        icon={<FileQuestion />}
        title="Page introuvable"
        titleAs="h1"
        description="L'adresse est peut-être mal saisie, ou la page a été déplacée."
        actions={
          <Button asChild>
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        }
      />
    </main>
  );
}
