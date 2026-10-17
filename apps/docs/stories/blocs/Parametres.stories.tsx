import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  Grid,
  Heading,
  Input,
  List,
  ListItem,
  ListItemIcon,
  ListSection,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Stack,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Textarea,
  toast,
  Toaster,
} from "@rovia/ui";
import { Bell, CreditCard, KeyRound, Laptop, Mail, MessageSquare, Shield, Smartphone, Trash2, User } from "lucide-react";

const meta: Meta = {
  title: "Blocs/Paramètres",
  parameters: {
    docs: {
      description: {
        component:
          "Page de paramètres de compte : navigation verticale (tiroir Drive), réglages à effet immédiat en listes groupées iOS (interrupteurs), formulaires enregistrés explicitement en cartes, zone dangereuse confirmée par une AlertDialog.",
      },
    },
  },
};
export default meta;

function Profile() {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Visible par les personnes avec qui vous partagez des fichiers.</CardDescription>
      </CardHeader>
      <CardContent>
        <Stack gap={5}>
          <Stack direction="row" gap={4} align="center">
            <Avatar size="lg"><AvatarFallback name="Inès Benali" /></Avatar>
            <Stack direction="row" gap={2}>
              <Button variant="tonal" size="sm">Changer la photo</Button>
              <Button variant="ghost" size="sm">Retirer</Button>
            </Stack>
          </Stack>
          <Grid columns={2} gap={4}>
            <Field label="Prénom"><Input defaultValue="Inès" autoComplete="given-name" /></Field>
            <Field label="Nom"><Input defaultValue="Benali" autoComplete="family-name" /></Field>
          </Grid>
          <Field label="Adresse e-mail" hint="Un lien de confirmation sera envoyé à la nouvelle adresse.">
            <Input type="email" defaultValue="ines@exemple.ma" autoComplete="email" />
          </Field>
          <Field label="Présentation">
            <Textarea autoResize defaultValue="Responsable financière chez Atlas Distribution." />
          </Field>
          <Grid columns={2} gap={4}>
            <Field label="Langue">
              <Select defaultValue="fr">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Fuseau horaire">
              <Select defaultValue="casa">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="casa">Casablanca (UTC+1)</SelectItem>
                  <SelectItem value="paris">Paris (UTC+2)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </Grid>
        </Stack>
      </CardContent>
      <CardFooter>
        <Button variant="ghost">Annuler</Button>
        <Button onClick={() => toast.success("Profil enregistré")}>Enregistrer</Button>
      </CardFooter>
    </Card>
  );
}

function Security() {
  return (
    <Stack gap={6}>
      <ListSection title="Connexion" footer="La validation en deux étapes demande un code à chaque connexion sur un nouvel appareil.">
        <List>
          <ListItem leading={<ListItemIcon tint="var(--ui-c1)"><KeyRound /></ListItemIcon>} trailing="Modifié il y a 3 mois" chevron asChild>
            <button type="button">Mot de passe</button>
          </ListItem>
          <ListItem
            leading={<ListItemIcon tint="var(--ui-c3)"><Shield /></ListItemIcon>}
            description="Application d'authentification"
            trailing={<Badge variant="ok" dot>Activée</Badge>}
            chevron
            asChild
          >
            <button type="button">Validation en deux étapes</button>
          </ListItem>
        </List>
      </ListSection>
      <ListSection title="Appareils connectés">
        <List>
          <ListItem leading={<ListItemIcon tint="var(--ui-c7)"><Laptop /></ListItemIcon>} description="Casablanca · cet appareil" trailing={<Badge variant="pri">Actif</Badge>}>
            Windows · Edge
          </ListItem>
          <ListItem leading={<ListItemIcon tint="var(--ui-c2)"><Smartphone /></ListItemIcon>} description="Rabat · il y a 2 jours" trailing={<Button variant="ghost" size="sm">Déconnecter</Button>}>
            iPhone 16
          </ListItem>
        </List>
      </ListSection>
      <DangerZone />
    </Stack>
  );
}

function DangerZone() {
  return (
    <Card variant="outlined" style={{ borderColor: "var(--ui-err-line)" }}>
      <CardHeader>
        <CardTitle>Supprimer le compte</CardTitle>
        <CardDescription>Vos fichiers seront supprimés définitivement après 30 jours.</CardDescription>
      </CardHeader>
      <CardFooter style={{ justifyContent: "flex-start" }}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="danger"><Trash2 />Supprimer le compte</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia tone="err"><Trash2 /></AlertDialogMedia>
              <AlertDialogTitle>Supprimer votre compte ?</AlertDialogTitle>
              <AlertDialogDescription>
                Vos 3,2 Go de fichiers et vos partages seront supprimés définitivement dans 30 jours.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel />
              <AlertDialogAction variant="destructive">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

function Notifications() {
  const [prefs, setPrefs] = React.useState({ partage: true, commentaires: true, stockage: true, nouveautes: false });
  const toggle = (key: keyof typeof prefs) => (v: boolean) => setPrefs((p) => ({ ...p, [key]: v }));
  return (
    <ListSection title="Me prévenir par e-mail" footer="Les alertes de sécurité sont toujours envoyées.">
      <List>
        <ListItem leading={<ListItemIcon tint="var(--ui-c1)"><User /></ListItemIcon>} description="Quand quelqu'un partage un fichier avec vous" trailing={<Switch checked={prefs.partage} onCheckedChange={toggle("partage")} aria-label="Partages" />}>
          Partages
        </ListItem>
        <ListItem leading={<ListItemIcon tint="var(--ui-c2)"><MessageSquare /></ListItemIcon>} description="Mentions et réponses" trailing={<Switch checked={prefs.commentaires} onCheckedChange={toggle("commentaires")} aria-label="Commentaires" />}>
          Commentaires
        </ListItem>
        <ListItem leading={<ListItemIcon tint="var(--ui-c4)"><Bell /></ListItemIcon>} description="À 80 % et 100 % de l'espace" trailing={<Switch checked={prefs.stockage} onCheckedChange={toggle("stockage")} aria-label="Espace de stockage" />}>
          Espace de stockage
        </ListItem>
        <ListItem leading={<ListItemIcon tint="var(--ui-c7)"><Mail /></ListItemIcon>} description="Une fois par mois" trailing={<Switch checked={prefs.nouveautes} onCheckedChange={toggle("nouveautes")} aria-label="Nouveautés" />}>
          Nouveautés
        </ListItem>
      </List>
    </ListSection>
  );
}

function Billing() {
  return (
    <Stack gap={5}>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Offre Essentiel</CardTitle>
          <CardDescription>15 Go · gratuit</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={21} label="Espace utilisé" showValue={(v) => `3,2 Go sur 15 Go (${v} %)`} />
        </CardContent>
        <CardFooter>
          <Button variant="tonal">Comparer les offres</Button>
          <Button>Passer à 100 Go</Button>
        </CardFooter>
      </Card>
      <ListSection title="Moyen de paiement">
        <List>
          <ListItem leading={<ListItemIcon tint="var(--ui-c6)"><CreditCard /></ListItemIcon>} description="Expire 08/2028" trailing="Modifier" chevron asChild>
            <button type="button">Visa •••• 4242</button>
          </ListItem>
        </List>
      </ListSection>
    </Stack>
  );
}

function Settings() {
  return (
    <div style={{ maxWidth: 1040 }}>
      <Toaster />
      <Stack gap={1} style={{ marginBottom: 24 }}>
        <Heading level={1} size="lg">Paramètres</Heading>
        <Text tone="muted">Gérez votre compte, votre sécurité et vos préférences.</Text>
      </Stack>
      <Tabs defaultValue="profil" orientation="vertical">
        <TabsList aria-label="Sections des paramètres">
          <TabsTrigger value="profil"><User />Profil</TabsTrigger>
          <TabsTrigger value="securite"><Shield />Sécurité</TabsTrigger>
          <TabsTrigger value="notifications"><Bell />Notifications</TabsTrigger>
          <TabsTrigger value="facturation"><CreditCard />Facturation</TabsTrigger>
        </TabsList>
        <TabsContent value="profil"><Profile /></TabsContent>
        <TabsContent value="securite"><Security /></TabsContent>
        <TabsContent value="notifications"><Notifications /></TabsContent>
        <TabsContent value="facturation"><Billing /></TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Réglages immédiats (interrupteurs) en listes groupées, formulaires enregistrés
 * explicitement en carte (une seule action primaire), suppression confirmée.
 */
export const Ecran: StoryObj = { name: "Écran complet", render: () => <Settings /> };
