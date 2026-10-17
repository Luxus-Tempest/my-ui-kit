import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
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
  Stack,
  Text,
} from "@rovia/ui";
import { Cloud, Eye, EyeOff, Mail } from "lucide-react";
import { Connexion as ConnexionBlock, connexionSample } from "@rovia/blocks/connexion";

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

/** Connexion : le bloc `@rovia/blocks/connexion`, branché sur ses données d'exemple. */
function Login() {
  const [error, setError] = React.useState<string | null>(null);
  const { errorMessage, ...sample } = connexionSample;
  return <ConnexionBlock {...sample} error={error} onSubmit={() => setError(errorMessage)} />;
}

/** Connexion : fournisseur tiers, e-mail et mot de passe, erreur globale annoncée. Soumettez pour voir l'erreur. */
export const Connexion: StoryObj = { render: () => <Login />, parameters: { registry: "connexion" } };

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
