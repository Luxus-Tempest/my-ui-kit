import * as React from "react";
import { Alert, AlertDescription } from "@rovia/ui/alert";
import { Button } from "@rovia/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@rovia/ui/card";
import { Checkbox } from "@rovia/ui/checkbox";
import { Field } from "@rovia/ui/field";
import { Input } from "@rovia/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@rovia/ui/input-group";
import { Stack } from "@rovia/ui/layout";
import { Separator } from "@rovia/ui/separator";
import { Link, Text } from "@rovia/ui/typography";
import { Cloud, Eye, EyeOff } from "lucide-react";

/** Ce que le formulaire envoie à `onSubmit`. */
export interface ConnexionValues {
  email: string;
  password: string;
  remember: boolean;
}

/** Un fournisseur tiers (« Continuer avec Google »). `id: "google"` affiche le logo Google. */
export interface ConnexionProvider {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface ConnexionProps {
  /** Nom affiché à côté du logo. */
  appName: string;
  /** Logo ; par défaut un nuage teinté de la couleur primaire. */
  logo?: React.ReactNode;
  title?: string;
  description?: string;
  /** Appelé à la soumission, avec les valeurs du formulaire. */
  onSubmit: (values: ConnexionValues) => void;
  /** Erreur globale (identifiants refusés…), annoncée au-dessus des champs. */
  error?: string | null;
  /** Envoi en cours : le bouton se désactive. */
  pending?: boolean;
  providers?: ConnexionProvider[];
  forgotPasswordHref?: string;
  signUpHref?: string;
  emailPlaceholder?: string;
}

/** Fond d'écran commun : fond d'application, marque, carte centrée. */
function Screen({ appName, logo, children }: { appName: string; logo?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "48px 16px",
        boxSizing: "border-box",
        background: "var(--ui-app)",
        // Couleur du texte du thème : sinon le texte hérite du `body` de l'application (sombre sur sombre).
        color: "var(--ui-fg)",
      }}
    >
      <Stack gap={6} align="center" style={{ width: "100%", maxWidth: 400 }}>
        <Stack direction="row" gap={2} align="center">
          <span style={{ display: "flex", color: "var(--ui-pri)" }}>{logo ?? <Cloud size={28} />}</span>
          <Text size={16} weight="semibold" style={{ fontSize: 20 }}>{appName}</Text>
        </Stack>
        {children}
      </Stack>
    </div>
  );
}

/** Champ mot de passe : bouton afficher / masquer intégré, nommé et à état. */
function PasswordInput({ name, autoComplete }: { name: string; autoComplete: string }) {
  const [visible, setVisible] = React.useState(false);
  return (
    <InputGroup>
      <InputGroupInput name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} />
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

/**
 * Écran de connexion : une carte centrée sur le fond d'application, une seule action
 * primaire, fournisseurs tiers en boutons secondaires, erreur globale annoncée.
 */
export function Connexion({
  appName,
  logo,
  title = "Connexion",
  description,
  onSubmit,
  error,
  pending = false,
  providers = [],
  forgotPasswordHref,
  signUpHref,
  emailPlaceholder = "nom@exemple.ma",
}: ConnexionProps) {
  return (
    <Screen appName={appName} logo={logo}>
      <Card variant="elevated" style={{ width: "100%", padding: 28, gap: 20 }}>
        <CardHeader style={{ textAlign: "center", display: "grid", justifyItems: "center" }}>
          <CardTitle style={{ fontSize: 22 }}>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              onSubmit({
                email: String(data.get("email") ?? ""),
                password: String(data.get("password") ?? ""),
                remember: data.get("remember") != null,
              });
            }}
          >
            <Stack gap={4}>
              {providers.length > 0 && (
                <>
                  {providers.map((p) => (
                    <Button key={p.id} type="button" variant="outline" size="lg" fullWidth onClick={p.onClick}>
                      {p.icon ?? (p.id === "google" ? <GoogleMark /> : null)}
                      {p.label}
                    </Button>
                  ))}
                  <Stack direction="row" gap={3} align="center">
                    <Separator style={{ flex: 1 }} />
                    <Text size={12} tone="subtle">ou</Text>
                    <Separator style={{ flex: 1 }} />
                  </Stack>
                </>
              )}
              {error && (
                <Alert tone="err">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Field label="Adresse e-mail">
                <Input name="email" type="email" autoComplete="email" placeholder={emailPlaceholder} />
              </Field>
              <Field label="Mot de passe">
                <PasswordInput name="password" autoComplete="current-password" />
              </Field>
              <Stack direction="row" justify="between" align="center">
                <Field label="Rester connecté" orientation="horizontal">
                  <Checkbox name="remember" defaultChecked />
                </Field>
                {forgotPasswordHref && <Link href={forgotPasswordHref}>Mot de passe oublié ?</Link>}
              </Stack>
              <Button type="submit" size="lg" fullWidth disabled={pending}>Se connecter</Button>
            </Stack>
          </form>
        </CardContent>
        {signUpHref && (
          <CardFooter style={{ justifyContent: "center" }}>
            <Text size={13} tone="muted">
              Pas encore de compte ? <Link href={signUpHref}>Créer un compte</Link>
            </Text>
          </CardFooter>
        )}
      </Card>
    </Screen>
  );
}
