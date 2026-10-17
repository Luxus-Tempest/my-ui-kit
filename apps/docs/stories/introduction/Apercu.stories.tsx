import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  Badge,
  Button,
  Calendar,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  Heading,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  List,
  ListItem,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Rating,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sparkline,
  Switch,
  Text,
  Textarea,
  Timeline,
  TimelineContent,
  TimelineIndicator,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
  Toaster,
  ToggleGroup,
  ToggleGroupItem,
  toast,
} from "@rovia/ui";
import { Check, Copy, CreditCard, Landmark, Pencil, Share2, Upload, UserPlus, Wallet } from "lucide-react";
import { REVENUE } from "../_shared/data";

const meta: Meta = {
  title: "Introduction/Aperçu",
  parameters: {
    padding: 32,
    docs: {
      description: {
        component:
          "Une vitrine : des cartes telles qu'on les écrit dans une application, chacune assemblée avec quelques composants de la librairie. Basculez le thème et le sens de lecture dans la barre d'outils.",
      },
    },
  },
};
export default meta;

/* ── Cartes ───────────────────────────────────────────────────────── */

function CreerUnCompte() {
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>Votre espace est prêt en moins d'une minute.</CardDescription>
      </CardHeader>
      <CardContent style={{ display: "grid", gap: 14 }}>
        <Field label="Nom complet"><Input placeholder="Nadia Alami" autoComplete="name" /></Field>
        <Field label="Adresse e-mail professionnelle"><Input type="email" placeholder="nadia@entreprise.ma" autoComplete="email" /></Field>
      </CardContent>
      <CardFooter style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
        <Button fullWidth onClick={() => toast.success("Compte créé")}>Créer mon compte</Button>
        <Text size={12} tone="subtle" style={{ textAlign: "center" }}>Gratuit pendant 30 jours, sans carte bancaire.</Text>
      </CardFooter>
    </Card>
  );
}

function ChiffreAffaires() {
  const data = REVENUE.map((r) => r.ca);
  const last = data[data.length - 1]!;
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardDescription>Chiffre d'affaires · octobre</CardDescription>
        <CardTitle style={{ fontSize: 30, letterSpacing: "-0.02em" }}>
          {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(last)}
        </CardTitle>
        <CardAction><Badge variant="ok">+12,4 %</Badge></CardAction>
      </CardHeader>
      <CardContent>
        <Sparkline data={data} height={64} curve="smooth" period="mois" label="Chiffre d'affaires sur 12 mois, en hausse" />
      </CardContent>
    </Card>
  );
}

function MoyenDePaiement() {
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Moyen de paiement</CardTitle>
        <CardDescription>Utilisé pour vos prochaines factures.</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup defaultValue="carte" aria-label="Moyen de paiement">
          <RadioGroupItem value="carte" description="Visa se terminant par 4242">Carte bancaire</RadioGroupItem>
          <RadioGroupItem value="virement" description="Sous 2 jours ouvrés">Virement</RadioGroupItem>
          <RadioGroupItem value="prelevement" description="Le 5 de chaque mois">Prélèvement</RadioGroupItem>
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button variant="tonal" fullWidth><CreditCard />Ajouter une carte</Button>
      </CardFooter>
    </Card>
  );
}

const MEMBRES = [
  { nom: "Inès Benali", email: "ines@acme.ma", role: "admin", online: true },
  { nom: "Karim Alaoui", email: "karim@acme.ma", role: "editeur" },
  { nom: "Fatima Zahra", email: "fz@acme.ma", role: "lecteur" },
];

function Equipe() {
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Membres de l'équipe</CardTitle>
        <CardDescription>Invitez vos collègues à collaborer.</CardDescription>
        <CardAction>
          <Button size="icon-sm" variant="ghost" aria-label="Inviter un membre"><UserPlus /></Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <List variant="plain">
          {MEMBRES.map((m) => (
            <ListItem
              key={m.email}
              leading={
                <Avatar>
                  <AvatarFallback name={m.nom} />
                  {m.online && <AvatarBadge label="En ligne" />}
                </Avatar>
              }
              description={m.email}
              trailing={
                <Select defaultValue={m.role}>
                  <SelectTrigger density="sm" aria-label={`Rôle de ${m.nom}`} style={{ width: 112 }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editeur">Éditeur</SelectItem>
                    <SelectItem value="lecteur">Lecteur</SelectItem>
                  </SelectContent>
                </Select>
              }
            >
              {m.nom}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

function Rendezvous() {
  const [date, setDate] = React.useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d;
  });
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Planifier un rendez-vous</CardTitle>
        <CardDescription>
          {date ? date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) : "Choisissez une date"}
        </CardDescription>
      </CardHeader>
      <CardContent style={{ display: "grid", justifyItems: "center", gap: 14 }}>
        <Calendar mode="single" selected={date} onSelect={setDate} />
        <ToggleGroup type="single" defaultValue="10:00" aria-label="Créneau" variant="outline" style={{ flexWrap: "wrap", justifyContent: "center" }}>
          {["09:00", "10:00", "11:30", "14:00"].map((h) => (
            <ToggleGroupItem key={h} value={h}>{h}</ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardContent>
    </Card>
  );
}

function Notifications() {
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choisissez ce qui mérite d'interrompre.</CardDescription>
      </CardHeader>
      <CardContent style={{ display: "grid", gap: 16 }}>
        <Field label="Factures payées" hint="Dès qu'un client règle" orientation="horizontal"><Switch defaultChecked /></Field>
        <Field label="Relances en retard" hint="Résumé chaque matin" orientation="horizontal"><Switch defaultChecked /></Field>
        <Field label="Nouveautés du produit" hint="Une fois par mois" orientation="horizontal"><Switch /></Field>
      </CardContent>
    </Card>
  );
}

function Partager() {
  const [copie, setCopie] = React.useState(false);
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Partager « Budget 2027 »</CardTitle>
        <CardDescription>Toute personne disposant du lien peut consulter.</CardDescription>
      </CardHeader>
      <CardContent style={{ display: "grid", gap: 16 }}>
        <InputGroup>
          <InputGroupInput readOnly value="https://nuage.acme.ma/f/1aB9-xK42" aria-label="Lien de partage" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label={copie ? "Lien copié" : "Copier le lien"}
              onClick={() => {
                setCopie(true);
                toast.success("Lien copié");
                window.setTimeout(() => setCopie(false), 1600);
              }}
            >
              {copie ? <Check /> : <Copy />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <Separator />
        <Text size={13} weight="medium">Personnes ayant accès</Text>
        <List variant="plain">
          <ListItem leading={<Avatar><AvatarFallback name="Sarah Benali" /></Avatar>} description="Propriétaire" trailing={<Text size={12} tone="subtle">Vous</Text>}>
            Sarah Benali
          </ListItem>
          <ListItem leading={<Avatar><AvatarFallback name="Inès Benali" /></Avatar>} description="Peut modifier">
            Inès Benali
          </ListItem>
        </List>
      </CardContent>
      <CardFooter>
        <Button fullWidth><Share2 />Inviter</Button>
      </CardFooter>
    </Card>
  );
}

function Activite() {
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Activité</CardTitle>
        <CardDescription>Dossier Finance</CardDescription>
      </CardHeader>
      <CardContent>
        <Timeline aria-label="Activité du dossier Finance">
          <TimelineItem>
            <TimelineIndicator tone="pri"><Pencil /></TimelineIndicator>
            <TimelineContent>
              <TimelineTitle><strong>Inès</strong> a modifié <strong>Budget 2027</strong></TimelineTitle>
              <TimelineTime dateTime="09:12">09:12</TimelineTime>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineIndicator tone="ok"><Wallet /></TimelineIndicator>
            <TimelineContent>
              <TimelineTitle>Facture <strong>F-2026-0118</strong> payée</TimelineTitle>
              <TimelineTime dateTime="08:40">08:40</TimelineTime>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineIndicator><Upload /></TimelineIndicator>
            <TimelineContent>
              <TimelineTitle><strong>Karim</strong> a importé 3 relevés</TimelineTitle>
              <TimelineTime dateTime="08:02">08:02</TimelineTime>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </CardContent>
    </Card>
  );
}

function Stockage() {
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Espace de stockage</CardTitle>
        <CardDescription>11,2 Go utilisés sur 15 Go</CardDescription>
      </CardHeader>
      <CardContent style={{ display: "grid", gap: 14 }}>
        <Progress value={75} tone="warn" aria-label="Espace utilisé : 75 %" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: 8, fontSize: 13 }}>
          <Text size={13}>Documents</Text><Text size={13} tone="muted" numeric>6,4 Go</Text>
          <Text size={13}>Photos</Text><Text size={13} tone="muted" numeric>3,9 Go</Text>
          <Text size={13}>Autres</Text><Text size={13} tone="muted" numeric>0,9 Go</Text>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" fullWidth><Landmark />Passer à 100 Go</Button>
      </CardFooter>
    </Card>
  );
}

function Verification() {
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Vérification en deux étapes</CardTitle>
        <CardDescription>Saisissez le code envoyé au 06 •• •• 42 18.</CardDescription>
      </CardHeader>
      <CardContent>
        <InputOTP maxLength={6} aria-label="Code à 6 chiffres">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </CardContent>
      <CardFooter style={{ display: "flex", gap: 8 }}>
        <Button>Vérifier</Button>
        <Button variant="ghost">Renvoyer le code</Button>
      </CardFooter>
    </Card>
  );
}

function Avis() {
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Votre avis</CardTitle>
        <CardDescription>Comment s'est passée la clôture du trimestre ?</CardDescription>
      </CardHeader>
      <CardContent style={{ display: "grid", gap: 14 }}>
        <Rating defaultValue={4} aria-label="Note de la clôture" />
        <Textarea placeholder="Ce qui vous a aidé, ce qui vous a freiné…" aria-label="Commentaire" rows={3} />
      </CardContent>
      <CardFooter>
        <Button variant="tonal" onClick={() => toast("Merci pour votre retour")}>Envoyer</Button>
      </CardFooter>
    </Card>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */

function Apercu() {
  return (
    <div style={{ display: "grid", gap: 40, maxWidth: 1200, margin: "0 auto" }}>
      <header style={{ display: "grid", justifyItems: "center", gap: 16, padding: "24px 0 8px", textAlign: "center" }}>
        <Badge variant="pri">Plus de 90 composants · clair, sombre, RTL</Badge>
        <Heading level={1} size="xl" style={{ maxWidth: 720 }}>
          Des composants React élégants, accessibles et prêts pour la production
        </Heading>
        <Text size={16} tone="muted" style={{ maxWidth: 620 }}>
          La clarté de Google Drive, la finesse d'iOS. Formulaires, données, navigation, messagerie et graphiques :
          tout ce qu'il faut pour un écran simple comme pour une application complète.
        </Text>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <Button size="lg" asChild><a href="?path=/docs/introduction-bienvenue--docs" target="_top">Commencer</a></Button>
          <Button size="lg" variant="outline" asChild><a href="?path=/docs/blocs-application--docs" target="_top">Voir les blocs</a></Button>
        </div>
      </header>

      <div style={{ columns: "3 300px", columnGap: 16 }}>
        {[CreerUnCompte, ChiffreAffaires, Equipe, MoyenDePaiement, Rendezvous, Notifications, Partager, Activite, Verification, Stockage, Avis].map(
          (Carte, i) => (
            <div key={i} style={{ breakInside: "avoid", marginBottom: 16 }}>
              <Carte />
            </div>
          ),
        )}
      </div>
      <Toaster />
    </div>
  );
}

export const Vitrine: StoryObj = { name: "Aperçu", render: () => <Apercu /> };
