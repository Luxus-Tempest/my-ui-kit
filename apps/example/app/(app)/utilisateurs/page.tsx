import type { Metadata } from "next";
import { Heading, Text } from "@acme/ui";
import { UsersTable } from "@/components/users-table";
import { getUtilisateurs } from "@/lib/donnees";

export const metadata: Metadata = { title: "Utilisateurs" };

export default function UtilisateursPage() {
  const utilisateurs = getUtilisateurs();
  return (
    <>
      <div className="grid gap-1">
        <Heading level={1} size="lg">Utilisateurs</Heading>
        <Text tone="muted">Gérez les accès à l'espace et les rôles de chacun.</Text>
      </div>
      <UsersTable utilisateurs={utilisateurs} />
    </>
  );
}
