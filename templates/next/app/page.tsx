import Link from "next/link";
import { Button, Heading, Text } from "@rovia/ui";
import { siteConfig } from "@/config/site";

/** Accueil public : remplace le par ta page d'accueil, ou installe des sections (registre @rovia). */
export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Text weight="semibold" style={{ fontSize: 18 }}>
          {siteConfig.name}
        </Text>
        <Button asChild variant="ghost">
          <Link href="/connexion">Se connecter</Link>
        </Button>
      </header>
      <main id="contenu" tabIndex={-1} className="grid flex-1 place-items-center px-6 pb-24 outline-none">
        <div className="grid max-w-xl justify-items-center gap-6 text-center">
          <Heading level={1} size="2xl">
            {siteConfig.name}
          </Heading>
          <Text tone="muted" style={{ fontSize: 17 }}>
            {siteConfig.description}
          </Text>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/inscription">Créer un compte</Link>
            </Button>
            <Button asChild size="lg" variant="tonal">
              <Link href="/connexion">Se connecter</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
