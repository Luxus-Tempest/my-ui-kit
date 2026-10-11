import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Field,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "@acme/ui";
import { Card, Row } from "../../_shared/demo";

/** Cases d'un code : deux groupes séparés par un tiret au-delà de 5 caractères. */
function Slots({ length = 6 }: { length?: number }) {
  const indexes = Array.from({ length }, (_, i) => i);
  if (length < 6) {
    return (
      <InputOTPGroup>
        {indexes.map((i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
    );
  }
  const half = Math.ceil(length / 2);
  return (
    <>
      <InputOTPGroup>
        {indexes.slice(0, half).map((i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        {indexes.slice(half).map((i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
    </>
  );
}

const meta = {
  title: "Composants/Formulaire/InputOTP",
  component: InputOTP,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Saisie d'un code à usage unique (vérification par SMS ou e-mail, double authentification). Un seul champ invisible porte la valeur, le clavier, le collage d'un code entier et l'auto-remplissage du système (`autocomplete=\"one-time-code\"`) ; les cases de 44 px au remplissage tonal n'en sont que l'affichage. Case active : filet primaire, halo et curseur clignotant. Chiffres seulement par défaut (pavé numérique sur mobile), `pattern` pour les lettres. `onComplete` quand le code est entier ; intégration `Field` (libellé, aide, erreur).",
      },
    },
  },
  args: { maxLength: 6, disabled: false, placeholder: "", children: null },
  argTypes: {
    maxLength: { control: { type: "number", min: 4, max: 8 } },
    disabled: { control: "boolean" },
    placeholder: { control: "text", description: "Un caractère par case, montré tant que le code est vide." },
    pattern: { table: { disable: true } },
    children: { table: { disable: true } },
    render: { table: { disable: true } },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
  },
  render: ({ maxLength, disabled, placeholder }) => (
    <InputOTP key={maxLength} maxLength={maxLength} disabled={disabled} placeholder={placeholder || undefined}>
      <Slots length={maxLength} />
    </InputOTP>
  ),
} satisfies Meta<typeof InputOTP>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/**
 * Six chiffres en deux groupes (le plus lisible à recopier), un code PIN de quatre
 * chiffres d'un seul tenant, un code alphanumérique (`REGEXP_ONLY_DIGITS_AND_CHARS`,
 * clavier complet) et une indication par case (`placeholder`).
 */
export const Variantes: Story = {
  render: () => (
    <Card width={520}>
      <Row label="6 chiffres">
        <InputOTP maxLength={6} aria-label="Code à 6 chiffres">
          <Slots length={6} />
        </InputOTP>
      </Row>
      <Row label="Code PIN">
        <InputOTP maxLength={4} aria-label="Code PIN">
          <Slots length={4} />
        </InputOTP>
      </Row>
      <Row label="Alphanumérique">
        <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} defaultValue="A7K" aria-label="Code de parrainage">
          <Slots length={6} />
        </InputOTP>
      </Row>
      <Row label="Indication">
        <InputOTP maxLength={6} placeholder="000000" aria-label="Code avec indication">
          <Slots length={6} />
        </InputOTP>
      </Row>
    </Card>
  ),
};

/** Vide, rempli, invalide (erreur du `Field` : toutes les cases au filet d'erreur) et désactivé. */
export const Etats: Story = {
  name: "États",
  render: () => (
    <Card width={400}>
      <Field label="Vide">
        <InputOTP maxLength={6}>
          <Slots />
        </InputOTP>
      </Field>
      <Field label="Rempli">
        <InputOTP maxLength={6} defaultValue="482913">
          <Slots />
        </InputOTP>
      </Field>
      <Field label="Invalide" error="Code incorrect, il vous reste 2 essais.">
        <InputOTP maxLength={6} defaultValue="482914">
          <Slots />
        </InputOTP>
      </Field>
      <Field label="Désactivé" disabled>
        <InputOTP maxLength={6} defaultValue="48">
          <Slots />
        </InputOTP>
      </Field>
    </Card>
  ),
};

function VerificationDemo() {
  const [code, setCode] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "checking" | "error" | "ok">("idle");
  const check = (value: string) => {
    setStatus("checking");
    window.setTimeout(() => setStatus(value === "123456" ? "ok" : "error"), 600);
  };
  return (
    <Card width={400}>
      <div style={{ display: "grid", gap: 4 }}>
        <span style={{ font: "600 17px/1.3 var(--ui-font-sans)", letterSpacing: "-0.01em" }}>Vérifiez votre numéro</span>
        <span style={{ color: "var(--ui-fg-2)", fontSize: 13.5 }}>Saisissez le code envoyé au 06 •• •• 42 18 (essayez 123456).</span>
      </div>
      <Field
        label="Code reçu par SMS"
        hint={status === "ok" ? "Numéro vérifié." : status === "checking" ? "Vérification…" : "Vous pouvez aussi coller le code entier."}
        error={status === "error" ? "Code incorrect, réessayez." : undefined}
      >
        <InputOTP
          maxLength={6}
          value={code}
          onValueChange={(value) => {
            setCode(value);
            if (status === "error") setStatus("idle");
          }}
          onComplete={check}
          disabled={status === "checking" || status === "ok"}
        >
          <Slots />
        </InputOTP>
      </Field>
      <div style={{ display: "flex", gap: 8 }}>
        <Button disabled={code.length < 6 || status !== "idle"} onClick={() => check(code)}>
          Vérifier
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setCode("");
            setStatus("idle");
          }}
        >
          Renvoyer le code
        </Button>
      </div>
    </Card>
  );
}

/**
 * Dans un `Field` : libellé, aide et erreur reliés au champ. Valeur contrôlée
 * (`value` + `onValueChange`) ; `onComplete` lance la vérification dès la sixième
 * case, le collage d'un code entier aussi.
 */
export const DansUnField: Story = {
  name: "Dans un Field",
  render: () => <VerificationDemo />,
};
