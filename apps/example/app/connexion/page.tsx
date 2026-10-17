import type { Metadata } from "next";
import NextLink from "next/link";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Checkbox, Field, Input, Link, Text } from "@rovia/ui";
import { connexion } from "@/lib/actions";

export const metadata: Metadata = { title: "Connexion" };

/*
 * Composant serveur pur, sans "use client" : il rend des composants clients de
 * la librairie avec des props sérialisables, et le formulaire part par une
 * server action. Rien de cette page n'embarque ECharts ni TanStack Table.
 */
export default function ConnexionPage() {
  return (
    <main className="grid min-h-svh place-items-center p-4">
      <Card variant="elevated" className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Accédez à l'espace documentaire de votre équipe.</CardDescription>
        </CardHeader>
        <form action={connexion} className="grid gap-5">
          <CardContent className="grid gap-4">
            <Field label="Adresse e-mail" required>
              <Input name="email" type="email" autoComplete="email" placeholder="nadia@acme.ma" />
            </Field>
            <Field label="Mot de passe" required>
              <Input name="motDePasse" type="password" autoComplete="current-password" />
            </Field>
            <Field label="Rester connecté" orientation="horizontal">
              <Checkbox name="memoriser" defaultChecked />
            </Field>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-3">
            <Button type="submit" fullWidth>Se connecter</Button>
            <Text size={13} tone="muted" className="text-center">
              Pas encore de compte ?{" "}
              <Link asChild>
                <NextLink href="/">Demander un accès</NextLink>
              </Link>
            </Text>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
