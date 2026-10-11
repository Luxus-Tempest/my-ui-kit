import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Badge,
  brandStyle,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  contrastRatio,
  createBrandTokens,
  Field,
  Link,
  List,
  ListItem,
  Progress,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
  ToggleGroup,
  ToggleGroupItem,
  type BrandTokens,
} from "@acme/ui";
import { Folder, Plus } from "lucide-react";

const meta: Meta = {
  title: "Fondations/Couleur de marque",
  parameters: {
    docs: {
      description: {
        component: [
          "Une seule couleur suffit : `createBrandTokens(couleur)` calcule toute la famille primaire (bouton plein, conteneur tonal, sélection, liens, focus) pour le clair **et** le sombre, en OKLCH. La teinte de la marque est gardée ; luminosité et saturation s'ajustent pour garantir les contrastes : texte sur le primaire ≥ 4,5:1, liens sur les surfaces ≥ 4,5:1, texte sur le conteneur ≥ 7:1.",
          "",
          "```tsx",
          'import { createBrandCss } from "@acme/ui";',
          "",
          "// Avec ou sans ThemeProvider (next-themes…) : une feuille de style après styles.css.",
          '<style>{createBrandCss("#7c3aed")}</style>',
          "```",
          "",
          "`createBrandTokens` rend les valeurs (`{ light, dark }`), `brandStyle(jetons)` les transforme en propriétés `--ui-*` pour un `style` React, `contrastRatio(a, b)` mesure un contraste WCAG.",
        ].join("\n"),
      },
    },
  },
};
export default meta;

const MARQUES = ["#0b57d0", "#7c3aed", "#0d9488", "#16a34a", "#fbbc04", "#f97316", "#dc2626", "#db2777", "#111111"];

function Contraste({ a, b, seuil, libelle }: { a: string; b: string; seuil: number; libelle: string }) {
  const ratio = contrastRatio(a, b);
  return (
    <Text size={12} tone={ratio >= seuil ? "muted" : "err"} numeric>
      {libelle} : {ratio.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}:1 (≥ {seuil})
    </Text>
  );
}

function Apercu({ jetons, mode }: { jetons: BrandTokens; mode: "light" | "dark" }) {
  return (
    <div data-theme={mode} style={{ ...brandStyle(jetons), borderRadius: "var(--ui-r-xl)", padding: 20, background: "var(--ui-app)", color: "var(--ui-fg)" }}>
      <Card variant="elevated">
        <CardContent style={{ display: "grid", gap: 16 }}>
          <Text weight="semibold">{mode === "light" ? "Clair" : "Sombre"}</Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Button>Enregistrer</Button>
            <Button variant="tonal"><Plus />Nouveau</Button>
            <Button variant="outline">Annuler</Button>
          </div>
          <Tabs defaultValue="fichiers">
            <TabsList aria-label={`Onglets ${mode}`}>
              <TabsTrigger value="fichiers">Fichiers</TabsTrigger>
              <TabsTrigger value="partages">Partagés</TabsTrigger>
            </TabsList>
          </Tabs>
          <ToggleGroup type="single" defaultValue="liste" aria-label={`Affichage ${mode}`}>
            <ToggleGroupItem value="liste">Liste</ToggleGroupItem>
            <ToggleGroupItem value="grille">Grille</ToggleGroupItem>
          </ToggleGroup>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <Chip selected>Sélectionnée</Chip>
            <Chip>Filtre</Chip>
            <Badge variant="pri">4 nouveautés</Badge>
          </div>
          <List variant="plain">
            <ListItem leading={<Folder />} selected>Finance</ListItem>
            <ListItem leading={<Folder />}>Juridique</ListItem>
          </List>
          <Field label="Relances automatiques" orientation="horizontal">
            <Switch defaultChecked />
          </Field>
          <Field label="Me prévenir par courriel" orientation="horizontal">
            <Checkbox defaultChecked />
          </Field>
          <Progress value={64} aria-label={`Progression ${mode}`} />
          <Text size={14}>
            Un <Link href="#lien">lien dans le texte</Link> reste lisible.
          </Text>
          <div style={{ display: "grid", gap: 2 }}>
            <Contraste a={jetons.pri} b={jetons["pri-fg"]} seuil={4.5} libelle="Texte sur le primaire" />
            <Contraste a={jetons.pri} b={mode === "light" ? "#f0f4f9" : "#26282b"} seuil={4.5} libelle="Lien sur la carte" />
            <Contraste a={jetons["on-pri-container"]} b={jetons["pri-container"]} seuil={7} libelle="Texte sur le conteneur" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Demo() {
  const [couleur, setCouleur] = React.useState("#7c3aed");
  const jetons = React.useMemo(() => createBrandTokens(couleur), [couleur]);
  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 1000 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <input type="color" value={couleur} onChange={(event) => setCouleur(event.target.value)} aria-label="Couleur de marque" />
          <Text size={13} numeric>{couleur}</Text>
        </label>
        {MARQUES.map((marque) => (
          <button
            key={marque}
            type="button"
            aria-label={`Marque ${marque}`}
            aria-pressed={marque === couleur}
            onClick={() => setCouleur(marque)}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: marque === couleur ? "2px solid var(--ui-fg)" : "1px solid var(--ui-line)",
              background: marque,
              cursor: "pointer",
            }}
          />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <Apercu jetons={jetons.light} mode="light" />
        <Apercu jetons={jetons.dark} mode="dark" />
      </div>
    </div>
  );
}

/** Choisissez une couleur (ou une marque toute faite) : clair et sombre se recalculent, contrastes affichés. */
export const Essayer: StoryObj = { name: "Essayer une couleur", render: () => <Demo /> };
