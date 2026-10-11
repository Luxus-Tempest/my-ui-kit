import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Heading, List, ListItem, Stat, StatGroup, Text } from "@acme/ui";
import { CircleAlert, FileText, MessagesSquare, Users } from "lucide-react";
import { ActivityChart } from "@/components/activity-chart";
import { getActivite, getDocuments, getUtilisateurs } from "@/lib/donnees";

/*
 * Composant serveur : il lit les données et rend les composants de la librairie
 * directement, tant que leurs props sont sérialisables (nombres, tableaux,
 * options Intl). Un graphique avec un formateur (une fonction) vit dans un
 * composant client : voir `ActivityChart`.
 */
export default function TableauDeBord() {
  const documents = getDocuments();
  const utilisateurs = getUtilisateurs();
  const activite = getActivite();
  const erreurs = documents.filter((d) => d.statut === "erreur");
  const recents = [...documents].sort((a, b) => b.modifie.localeCompare(a.modifie)).slice(0, 5);

  return (
    <>
      <div className="grid gap-1">
        <Heading level={1} size="lg">Bonjour Nadia</Heading>
        <Text tone="muted">Voici l'activité de votre espace documentaire.</Text>
      </div>

      <StatGroup aria-label="Indicateurs">
        <Stat
          label="Documents"
          icon={<FileText />}
          value={documents.length * 38}
          delta={0.12}
          deltaLabel="vs mois dernier"
          trend={activite.map((a) => a.documents)}
        />
        <Stat
          label="Requêtes aux agents"
          icon={<MessagesSquare />}
          value={activite.at(-1)!.requetes}
          delta={0.21}
          deltaLabel="vs mois dernier"
          trend={activite.map((a) => a.requetes)}
        />
        <Stat
          label="Utilisateurs actifs"
          icon={<Users />}
          value={utilisateurs.filter((u) => u.statut === "actif").length}
          delta={2}
          deltaFormat={{ style: "decimal", maximumFractionDigits: 0 }}
          deltaLabel="ce mois-ci"
        />
        <Stat
          label="Échecs d'indexation"
          icon={<CircleAlert />}
          value={erreurs.length}
          delta={-0.25}
          deltaLabel="vs mois dernier"
          positiveIsGood={false}
        />
      </StatGroup>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Activité</CardTitle>
            <CardDescription>Documents importés et requêtes aux agents, par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart data={activite} />
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Modifiés récemment</CardTitle>
          </CardHeader>
          <CardContent>
            <List variant="plain">
              {recents.map((d) => (
                <ListItem
                  key={d.id}
                  leading={<FileText />}
                  description={`${d.dossier} · ${d.proprietaire}`}
                  trailing={d.statut === "erreur" ? <Badge variant="err">Erreur</Badge> : undefined}
                >
                  {d.nom}
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
