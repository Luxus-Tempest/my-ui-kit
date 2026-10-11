import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Link,
  Progress,
  Separator,
  Stack,
  Text,
} from "@acme/ui";
import { Cloud, Eye, EyeOff, Mail } from "lucide-react";

const meta: Meta = {
  title: "Blocs/Authentification",
  parameters: {
    padding: 0,
    docs: {
      description: {
        component:
          "Écrans de connexion et d'inscription : une carte centrée sur le fond d'application, une seule action primaire, fournisseurs tiers en boutons secondaires, erreurs reliées aux champs par `Field`.",
      },
    },
  },
};
export default meta;

/** Fond d'écran commun : fond d'application, marque, carte centrée. */
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "48px 16px",
        boxSizing: "border-box",
        background: "var(--ui-app)",
      }}
    >
      <Stack gap={6} align="center" style={{ width: "100%", maxWidth: 400 }}>
        <Stack direction="row" gap={2} align="center">
          <span style={{ display: "flex", color: "var(--ui-pri)" }}><Cloud size={28} /></span>
          <Text size={16} weight="semibold" style={{ fontSize: 20 }}>Nuage</Text>
        </Stack>
        {children}
      </Stack>
    </div>
  );
}

/** Champ mot de passe : bouton afficher / masquer intégré, nommé et à état. */
function PasswordInput({ autoComplete }: { autoComplete: string }) {
  const [visible, setVisible] = React.useState(false);
  return (
    <InputGroup>
      <InputGroupInput type={visible ? "text" : "password"} autoComplete={autoComplete} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-sm"
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

const GoogleMark = () => (
  <svg viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
  </svg>
);

function Login() {
  const [error, setError] = React.useState(false);
  return (
    <Screen>
      <Card variant="elevated" style={{ width: "100%", padding: 28, gap: 20 }}>
        <CardHeader style={{ textAlign: "center", display: "grid", justifyItems: "center" }}>
          <CardTitle style={{ fontSize: 22 }}>Connexion</CardTitle>
          <CardDescription>Accédez à vos fichiers, où que vous soyez.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(true);
            }}
          >
            <Stack gap={4}>
              <Button type="button" variant="outline" size="lg" fullWidth>
                <GoogleMark />
                Continuer avec Google
              </Button>
              <Stack direction="row" gap={3} align="center">
                <Separator style={{ flex: 1 }} />
                <Text size={12} tone="subtle">ou</Text>
                <Separator style={{ flex: 1 }} />
              </Stack>
              {error && (
                <Alert tone="err">
                  <AlertDescription>Adresse ou mot de passe incorrect.</AlertDescription>
                </Alert>
              )}
              <Field label="Adresse e-mail">
                <Input type="email" autoComplete="email" placeholder="nom@exemple.ma" />
              </Field>
              <Field label="Mot de passe">
                <PasswordInput autoComplete="current-password" />
              </Field>
              <Stack direction="row" justify="between" align="center">
                <Field label="Rester connecté" orientation="horizontal">
                  <Checkbox defaultChecked />
                </Field>
                <Link href="#mot-de-passe-oublie">Mot de passe oublié ?</Link>
              </Stack>
              <Button type="submit" size="lg" fullWidth>Se connecter</Button>
            </Stack>
          </form>
        </CardContent>
        <CardFooter style={{ justifyContent: "center" }}>
          <Text size={13} tone="muted">
            Pas encore de compte ? <Link href="#inscription">Créer un compte</Link>
          </Text>
        </CardFooter>
      </Card>
    </Screen>
  );
}

/** Connexion : fournisseur tiers, e-mail et mot de passe, erreur globale annoncée. Soumettez pour voir l'erreur. */
export const Connexion: StoryObj = { render: () => <Login /> };

/** Force du mot de passe : barre teintée par le ton, critères listés en clair (jamais la couleur seule). */
function strength(pwd: string) {
  const checks = [pwd.length >= 10, /[A-Z]/.test(pwd) && /[a-z]/.test(pwd), /\d/.test(pwd), /[^\w\s]/.test(pwd)];
  return { score: checks.filter(Boolean).length, checks };
}

function Signup() {
  const [pwd, setPwd] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const { score, checks } = strength(pwd);
  const tone = score <= 1 ? "err" : score <= 3 ? "warn" : "ok";
  const label = ["Très faible", "Faible", "Moyen", "Bon", "Excellent"][score];
  const criteria = ["10 caractères au moins", "Majuscules et minuscules", "Un chiffre", "Un symbole"];
  return (
    <Screen>
      <Card variant="elevated" style={{ width: "100%", padding: 28, gap: 20 }}>
        <CardHeader style={{ textAlign: "center", display: "grid", justifyItems: "center" }}>
          <CardTitle style={{ fontSize: 22 }}>Créer un compte</CardTitle>
          <CardDescription>15 Go gratuits pour commencer.</CardDescription>
        </CardHeader>
        <CardContent>
          <Stack gap={4}>
            <Field label="Nom complet">
              <Input autoComplete="name" placeholder="Inès Benali" />
            </Field>
            <Field label="Adresse e-mail" hint="Nous y enverrons un code de vérification.">
              <InputGroup>
                <InputGroupAddon><Mail /></InputGroupAddon>
                <InputGroupInput type="email" autoComplete="email" placeholder="nom@exemple.ma" />
              </InputGroup>
            </Field>
            <Field label="Mot de passe">
              <InputGroup>
                <InputGroupInput
                  type={visible ? "text" : "password"}
                  autoComplete="new-password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-sm"
                    aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    aria-pressed={visible}
                    onClick={() => setVisible(!visible)}
                  >
                    {visible ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
            {pwd && (
              <Stack gap={2}>
                <Progress value={(score / 4) * 100} tone={tone} size="sm" label={`Force : ${label}`} />
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 2 }}>
                  {criteria.map((c, i) => (
                    <li key={c}>
                      <Text size={12.5} tone={checks[i] ? "ok" : "subtle"}>
                        {checks[i] ? "✓ " : ""}{c}
                      </Text>
                    </li>
                  ))}
                </ul>
              </Stack>
            )}
            <Field label="J'accepte les conditions d'utilisation" orientation="horizontal">
              <Checkbox />
            </Field>
            <Button size="lg" fullWidth disabled={score < 3}>Créer mon compte</Button>
          </Stack>
        </CardContent>
        <CardFooter style={{ justifyContent: "center" }}>
          <Text size={13} tone="muted">
            Déjà inscrit ? <Link href="#connexion">Se connecter</Link>
          </Text>
        </CardFooter>
      </Card>
    </Screen>
  );
}

/** Inscription : force du mot de passe en direct, critères explicites, action primaire tant que le mot de passe est trop faible. */
export const Inscription: StoryObj = { render: () => <Signup /> };
