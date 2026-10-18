"use client";
/* @rovia/ui 1.1.0 · parametres */
import * as React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@rovia/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@rovia/ui/avatar";
import { Badge } from "@rovia/ui/badge";
import { Button } from "@rovia/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@rovia/ui/card";
import { Field } from "@rovia/ui/field";
import { Input, Textarea } from "@rovia/ui/input";
import { Grid, Stack } from "@rovia/ui/layout";
import { List, ListItem, ListItemIcon, ListSection } from "@rovia/ui/list";
import { Progress } from "@rovia/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@rovia/ui/select";
import { Switch } from "@rovia/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rovia/ui/tabs";
import { toast } from "@rovia/ui/toast";
import { Heading, Text } from "@rovia/ui/typography";
import { Bell, CreditCard, KeyRound, Laptop, Mail, MessageSquare, Shield, Smartphone, Trash2, User } from "lucide-react";


export interface ParametresUser {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  /** Valeur de la langue : `fr`, `ar` ou `en`. */
  language: string;
  /** Valeur du fuseau : `casa` ou `paris` (liste à adapter dans le bloc). */
  timezone: string;
}

export interface ParametresDevice {
  id: string;
  name: string;
  /** Lieu et dernière activité (« Rabat · il y a 2 jours »). */
  description: string;
  kind: "computer" | "phone";
  /** Appareil de la session en cours : badge « Actif » au lieu du bouton Déconnecter. */
  current?: boolean;
}

export interface ParametresPlan {
  name: string;
  description: string;
  usedPercent: number;
  /** « 3,2 Go sur 15 Go » ; le pourcentage est ajouté après. */
  usageLabel: string;
  upgradeLabel: string;
}

export interface ParametresProps {
  user: ParametresUser;
  devices: ParametresDevice[];
  plan: ParametresPlan;
  paymentMethod: { label: string; expiry: string };
  /** Ce que la suppression du compte efface, dans la confirmation. */
  deleteDescription: string;
  /** Enregistrement du profil ; sans lui, un message « Profil enregistré » s'affiche. */
  onSaveProfile?: (user: ParametresUser) => void;
  onDeleteAccount?: () => void;
}

function Profile({ user, onSave }: { user: ParametresUser; onSave?: (user: ParametresUser) => void }) {
  const form = React.useRef<HTMLFormElement>(null);
  const save = () => {
    const data = new FormData(form.current!);
    const text = (key: string) => String(data.get(key) ?? "");
    const next = {
      ...user,
      firstName: text("firstName"),
      lastName: text("lastName"),
      email: text("email"),
      bio: text("bio"),
      language: text("language"),
      timezone: text("timezone"),
    };
    if (onSave) onSave(next);
    else toast.success("Profil enregistré");
  };
  return (
    <form ref={form} onSubmit={(e) => (e.preventDefault(), save())}>
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Visible par les personnes avec qui vous partagez des fichiers.</CardDescription>
      </CardHeader>
      <CardContent>
        <Stack gap={5}>
          <Stack direction="row" gap={4} align="center">
            <Avatar size="lg"><AvatarFallback name={`${user.firstName} ${user.lastName}`} /></Avatar>
            <Stack direction="row" gap={2}>
              <Button variant="tonal" size="sm">Changer la photo</Button>
              <Button variant="ghost" size="sm">Retirer</Button>
            </Stack>
          </Stack>
          <Grid columns={2} gap={4}>
            <Field label="Prénom"><Input name="firstName" defaultValue={user.firstName} autoComplete="given-name" /></Field>
            <Field label="Nom"><Input name="lastName" defaultValue={user.lastName} autoComplete="family-name" /></Field>
          </Grid>
          <Field label="Adresse e-mail" hint="Un lien de confirmation sera envoyé à la nouvelle adresse.">
            <Input name="email" type="email" defaultValue={user.email} autoComplete="email" />
          </Field>
          <Field label="Présentation">
            <Textarea name="bio" autoResize defaultValue={user.bio} />
          </Field>
          <Grid columns={2} gap={4}>
            <Field label="Langue">
              <Select name="language" defaultValue={user.language}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Fuseau horaire">
              <Select name="timezone" defaultValue={user.timezone}>
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
        <Button type="reset" variant="ghost">Annuler</Button>
        <Button type="submit">Enregistrer</Button>
      </CardFooter>
    </Card>
    </form>
  );
}

function Security({ devices, deleteDescription, onDeleteAccount }: { devices: ParametresDevice[]; deleteDescription: string; onDeleteAccount?: () => void }) {
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
          {devices.map((d) => (
            <ListItem
              key={d.id}
              leading={<ListItemIcon tint={d.kind === "phone" ? "var(--ui-c2)" : "var(--ui-c7)"}>{d.kind === "phone" ? <Smartphone /> : <Laptop />}</ListItemIcon>}
              description={d.description}
              trailing={d.current ? <Badge variant="pri">Actif</Badge> : <Button variant="ghost" size="sm">Déconnecter</Button>}
            >
              {d.name}
            </ListItem>
          ))}
        </List>
      </ListSection>
      <DangerZone description={deleteDescription} onConfirm={onDeleteAccount} />
    </Stack>
  );
}

function DangerZone({ description, onConfirm }: { description: string; onConfirm?: () => void }) {
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
                {description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel />
              <AlertDialogAction variant="destructive" onClick={onConfirm}>Supprimer</AlertDialogAction>
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

function Billing({ plan, paymentMethod }: { plan: ParametresPlan; paymentMethod: { label: string; expiry: string } }) {
  return (
    <Stack gap={5}>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>{plan.name}</CardTitle>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={plan.usedPercent} label="Espace utilisé" showValue={(v) => `${plan.usageLabel} (${v} %)`} />
        </CardContent>
        <CardFooter>
          <Button variant="tonal">Comparer les offres</Button>
          <Button>{plan.upgradeLabel}</Button>
        </CardFooter>
      </Card>
      <ListSection title="Moyen de paiement">
        <List>
          <ListItem leading={<ListItemIcon tint="var(--ui-c6)"><CreditCard /></ListItemIcon>} description={paymentMethod.expiry} trailing="Modifier" chevron asChild>
            <button type="button">{paymentMethod.label}</button>
          </ListItem>
        </List>
      </ListSection>
    </Stack>
  );
}

/**
 * Page de paramètres de compte : navigation verticale, réglages à effet immédiat en listes groupées
 * (interrupteurs), formulaires enregistrés explicitement en cartes, suppression confirmée.
 */
export function Parametres({ user, devices, plan, paymentMethod, deleteDescription, onSaveProfile, onDeleteAccount }: ParametresProps) {
  return (
    <div style={{ maxWidth: 1040 }}>
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
        <TabsContent value="profil"><Profile user={user} onSave={onSaveProfile} /></TabsContent>
        <TabsContent value="securite"><Security devices={devices} deleteDescription={deleteDescription} onDeleteAccount={onDeleteAccount} /></TabsContent>
        <TabsContent value="notifications"><Notifications /></TabsContent>
        <TabsContent value="facturation"><Billing plan={plan} paymentMethod={paymentMethod} /></TabsContent>
      </Tabs>
    </div>
  );
}

