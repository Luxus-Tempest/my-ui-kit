import * as React from "react";
import { Alert, AlertDescription } from "@rovia/ui/alert";
import { Button } from "@rovia/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@rovia/ui/card";
import { Checkbox } from "@rovia/ui/checkbox";
import { Field } from "@rovia/ui/field";
import { Input } from "@rovia/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@rovia/ui/input-group";
import { Stack } from "@rovia/ui/layout";
import { Progress } from "@rovia/ui/progress";
import { Link, Text } from "@rovia/ui/typography";
import { Cloud, Eye, EyeOff, Mail } from "lucide-react";

/** Ce que le formulaire envoie à `onSubmit`. */
export interface InscriptionValues {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export interface InscriptionProps {
  /** Nom affiché à côté du logo. */
  appName: string;
  /** Logo ; par défaut un nuage teinté de la couleur primaire. */
  logo?: React.ReactNode;
  title?: string;
  description?: string;
  /** Appelé à la soumission, quand le mot de passe est assez fort et les conditions acceptées. */
  onSubmit: (values: InscriptionValues) => void;
  /** Erreur globale (adresse déjà utilisée, conditions non acceptées…), annoncée au dessus des champs. */
  error?: string | null;
  /** Envoi en cours : le bouton se désactive. */
  pending?: boolean;
  signInHref?: string;
  namePlaceholder?: string;
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

/** Force du mot de passe : nombre de critères remplis sur quatre. */
function strength(pwd: string) {
  const checks = [pwd.length >= 10, /[A-Z]/.test(pwd) && /[a-z]/.test(pwd), /\d/.test(pwd), /[^\w\s]/.test(pwd)];
  return { score: checks.filter(Boolean).length, checks };
}

const CRITERIA = ["10 caractères au moins", "Majuscules et minuscules", "Un chiffre", "Un symbole"];
const LEVELS = ["Très faible", "Faible", "Moyen", "Bon", "Excellent"];

/**
 * Écran d'inscription : force du mot de passe en direct, critères explicites (jamais la couleur
 * seule), action primaire désactivée tant que le mot de passe est trop faible.
 */
export function Inscription({
  appName,
  logo,
  title = "Créer un compte",
  description,
  onSubmit,
  error,
  pending = false,
  signInHref,
  namePlaceholder = "Inès Benali",
  emailPlaceholder = "nom@exemple.ma",
}: InscriptionProps) {
  const [pwd, setPwd] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const { score, checks } = strength(pwd);
  const tone = score <= 1 ? "err" : score <= 3 ? "warn" : "ok";
  return (
    <Screen appName={appName} logo={logo}>
      <Card variant="elevated" style={{ width: "100%", padding: 28, gap: 20 }}>
        <CardHeader style={{ textAlign: "center", display: "grid", justifyItems: "center" }}>
          <CardTitle role="heading" aria-level={1} style={{ fontSize: 22 }}>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              onSubmit({
                name: String(data.get("name") ?? ""),
                email: String(data.get("email") ?? ""),
                password: pwd,
                acceptTerms: data.get("terms") != null,
              });
            }}
          >
            <Stack gap={4}>
              {error && (
                <Alert tone="err">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Field label="Nom complet">
                <Input name="name" autoComplete="name" placeholder={namePlaceholder} />
              </Field>
              <Field label="Adresse e-mail" hint="Nous y enverrons un code de vérification.">
                <InputGroup>
                  <InputGroupAddon><Mail /></InputGroupAddon>
                  <InputGroupInput name="email" type="email" autoComplete="email" placeholder={emailPlaceholder} />
                </InputGroup>
              </Field>
              <Field label="Mot de passe">
                <InputGroup>
                  <InputGroupInput
                    name="password"
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
                  <Progress value={(score / 4) * 100} tone={tone} size="sm" label={`Force : ${LEVELS[score]}`} />
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 2 }}>
                    {CRITERIA.map((c, i) => (
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
                <Checkbox name="terms" />
              </Field>
              <Button type="submit" size="lg" fullWidth disabled={score < 3 || pending}>Créer mon compte</Button>
            </Stack>
          </form>
        </CardContent>
        {signInHref && (
          <CardFooter style={{ justifyContent: "center" }}>
            <Text size={13} tone="muted">
              Déjà inscrit ? <Link href={signInHref}>Se connecter</Link>
            </Text>
          </CardFooter>
        )}
      </Card>
    </Screen>
  );
}
