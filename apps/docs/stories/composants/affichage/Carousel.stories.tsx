import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  AspectRatio,
  Card,
  CardDescription,
  CardMedia,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@rovia/ui";
import { Bell, Calendar, FileImage, FileSpreadsheet, FileText, Package, Presentation, TrendingUp, Truck } from "lucide-react";

/* ── Visuels de démo : SVG en data-URI et dégradés de jetons, aucune ressource externe ── */

function landscape(sky: [string, string], hills: [string, string, string], sun = "#fff7e0") {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900' preserveAspectRatio='xMidYMid slice'>
    <defs><linearGradient id='c' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${sky[0]}'/><stop offset='1' stop-color='${sky[1]}'/></linearGradient></defs>
    <rect width='1600' height='900' fill='url(#c)'/>
    <circle cx='1150' cy='290' r='105' fill='${sun}' opacity='.92'/>
    <path d='M0 600C220 470 420 500 640 560s460-90 960 10v330H0z' fill='${hills[0]}'/>
    <path d='M0 700c300-110 560-80 820-30s460-40 780 0v230H0z' fill='${hills[1]}'/>
    <path d='M0 800c260-60 520-50 800-10s520 20 800-20v130H0z' fill='${hills[2]}'/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const PHOTOS = [
  { src: landscape(["#2a78d6", "#cde2fb"], ["#6da7ec", "#1baf7a", "#008300"]), alt: "Collines vertes sous un ciel bleu", title: "Atlas, au printemps" },
  { src: landscape(["#eb6834", "#f6d7a6"], ["#e87ba4", "#d55181", "#6250d6"]), alt: "Dunes roses au coucher du soleil", title: "Merzouga, au couchant" },
  { src: landscape(["#0d366b", "#6250d6"], ["#256abf", "#184f95", "#0d366b"], "#e3e3e3"), alt: "Vallée bleutée sous la lune", title: "Ifrane, la nuit" },
  { src: landscape(["#9ec5f4", "#e6f4ea"], ["#1baf7a", "#eda100", "#146c2e"]), alt: "Champs dorés au pied des collines", title: "Saïss, en été" },
  { src: landscape(["#e34948", "#eda100"], ["#eb6834", "#8f4c00", "#3c4d75"], "#fef3e0"), alt: "Plateau ocre sous un ciel embrasé", title: "Ouarzazate, à l'aube" },
];

/** Dégradé « photo » à base de la palette catégorielle : suit le thème clair / sombre. */
const scene = (a: number, b: number): React.CSSProperties => ({
  background: `radial-gradient(120% 90% at 85% 10%, color-mix(in srgb, var(--ui-c${b}) 70%, transparent), transparent 62%), linear-gradient(155deg, var(--ui-c${a}), color-mix(in srgb, var(--ui-c${a}) 45%, var(--ui-c${b})))`,
});

/** Paires de teintes voisines : le dégradé reste franc (bleu + ambre virerait au gris). */
const PAIRS = [
  [1, 7],
  [2, 4],
  [3, 6],
  [7, 5],
  [8, 2],
] as const;

const FILES = [
  { title: "Budget 2027", meta: "Modifié hier", icon: FileSpreadsheet, c: [6, 3] },
  { title: "Présentation au comité", meta: "Modifié lundi", icon: Presentation, c: [4, 2] },
  { title: "Contrat Atlas Distribution", meta: "Partagé par Nadia", icon: FileText, c: [1, 7] },
  { title: "Photos du chantier", meta: "12 éléments", icon: FileImage, c: [7, 5] },
  { title: "Rapport annuel", meta: "Modifié le 2 oct.", icon: FileText, c: [8, 2] },
  { title: "Inventaire Tanger", meta: "Ouvert il y a 3 j", icon: FileSpreadsheet, c: [3, 1] },
] as const;

function FileCard({ file }: { file: (typeof FILES)[number] }) {
  const Icon = file.icon;
  return (
    <Card asChild size="sm">
      <a href={`#${file.title}`}>
        <CardMedia aspectRatio="16 / 10" style={{ ...scene(file.c[0], file.c[1]), display: "grid", placeItems: "center", color: "#fff" }}>
          <Icon size={30} strokeWidth={1.5} aria-hidden />
        </CardMedia>
        <div>
          <CardTitle>{file.title}</CardTitle>
          <CardDescription>{file.meta}</CardDescription>
        </div>
      </a>
    </Card>
  );
}

const sectionTitle: React.CSSProperties = { margin: 0, color: "var(--ui-fg)", font: "600 16px/1.35 var(--ui-font-sans)", letterSpacing: "-0.012em" };

/* ── Page ────────────────────────────────────────────────────────────── */

const meta = {
  title: "Composants/Affichage/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  parameters: {
    registry: "carousel",
    docs: {
      description: {
        component:
          "Fait défiler une suite de diapositives (Embla) : au doigt, à la souris, aux flèches ← / → quand le focus est dans le carrousel. `Carousel` › `CarouselContent` › `CarouselItem`, puis `CarouselPrevious` / `CarouselNext` (boutons ronds surélevés, désactivés aux bornes sans `loop`) et `CarouselDots` (pastilles d'iOS). `opts` passe les options d'Embla, `setApi` donne son API, `slidesPerView` et `spacing` règlent la mise en page. Mouvement réduit respecté.",
      },
    },
  },
  args: { orientation: "horizontal", slidesPerView: 1, spacing: 4 },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    slidesPerView: { control: { type: "number", min: 1, max: 5, step: 0.25 } },
    spacing: { control: { type: "number", min: 0, max: 8, step: 1 } },
    opts: { control: "object" },
    plugins: { table: { disable: true } },
    setApi: { table: { disable: true } },
    labels: { table: { disable: true } },
  },
  render: (args) => (
    <Carousel {...args} aria-label="Démonstration" style={{ maxWidth: 520 }}>
      <CarouselContent style={args.orientation === "vertical" ? { height: 260 } : undefined}>
        {[1, 2, 3, 4, 5].map((n) => (
          <CarouselItem key={n}>
            <div
              style={{
                ...scene(PAIRS[n - 1][0], PAIRS[n - 1][1]),
                display: "grid",
                placeItems: "center",
                height: args.orientation === "vertical" ? "100%" : 220,
                borderRadius: "var(--ui-r-lg)",
                color: "#fff",
                font: "600 40px/1 var(--ui-font-sans)",
              }}
            >
              {n}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  ),
} satisfies Meta<typeof Carousel>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Orientation, diapositives par vue et espacement pilotables depuis les Contrôles. */
export const Playground: Story = {};

/**
 * La rangée « Accès rapide » de Drive : trois cartes par vue, flèches `inline`
 * dans l'en-tête. Chaque carte est un lien : Tab fait défiler jusqu'à elle.
 */
export const Cartes: Story = {
  render: () => (
    <Carousel aria-label="Accès rapide" opts={{ align: "start" }} slidesPerView={3} spacing={3} style={{ maxWidth: 820 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <h3 style={sectionTitle}>Accès rapide</h3>
        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          <CarouselPrevious placement="inline" variant="outline" size="icon-sm" />
          <CarouselNext placement="inline" variant="outline" size="icon-sm" />
        </div>
      </div>
      <CarouselContent>
        {FILES.map((file) => (
          <CarouselItem key={file.title}>
            <FileCard file={file} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  ),
};

/**
 * Galerie d'images en boucle : `AspectRatio` 16 / 9, flèches posées sur
 * l'image (révélées au survol) et points dans une capsule translucide.
 */
export const Images: Story = {
  render: () => (
    <Carousel aria-label="Photos du séminaire" opts={{ loop: true }} style={{ maxWidth: 640 }}>
      <CarouselContent>
        {PHOTOS.map((photo) => (
          <CarouselItem key={photo.title}>
            <AspectRatio style={{ borderRadius: "var(--ui-r-lg)" }}>
              <img src={photo.src} alt={photo.alt} draggable={false} />
            </AspectRatio>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots variant="overlay" />
    </Carousel>
  ),
};

const NEWS = [
  { icon: Bell, title: "Clôture mensuelle", text: "Les écritures de septembre sont à valider avant vendredi.", c: [1, 7] },
  { icon: Truck, title: "Livraison en route", text: "La commande CMD-2291 arrive à Tanger demain matin.", c: [3, 6] },
  { icon: TrendingUp, title: "Chiffre d'affaires", text: "+12 % sur le trimestre, porté par la région Nord.", c: [2, 4] },
  { icon: Calendar, title: "Comité de direction", text: "Mardi 14 h, salle Atlas : ordre du jour partagé.", c: [7, 5] },
  { icon: Package, title: "Stock bas", text: "Trois références passent sous le seuil d'alerte.", c: [8, 2] },
] as const;

/**
 * Vertical : ↑ / ↓ au clavier, flèches en haut et en bas, points à droite.
 * La hauteur se pose sur `CarouselContent`.
 */
export const Vertical: Story = {
  render: () => (
    <Carousel aria-label="Annonces" orientation="vertical" opts={{ align: "start" }} spacing={3} style={{ maxWidth: 460 }}>
      <CarouselContent style={{ height: 196 }}>
        {NEWS.map(({ icon: Icon, title, text, c }) => (
          <CarouselItem key={title}>
            <Card variant="filled" style={{ height: "100%", boxSizing: "border-box", flexDirection: "row", alignItems: "center", gap: 16 }}>
              <span
                aria-hidden
                style={{ ...scene(c[0], c[1]), display: "grid", placeItems: "center", flexShrink: 0, width: 52, height: 52, borderRadius: "var(--ui-r-md)", color: "#fff" }}
              >
                <Icon size={24} strokeWidth={1.75} />
              </span>
              <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{text}</CardDescription>
              </div>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  ),
};

/**
 * Plusieurs par vue. `slidesPerView={1.15}` laisse deviner la suivante (mobile) ;
 * `slidesToScroll: "auto"` avance d'une page entière, et les points comptent les pages.
 */
export const PlusieursParVue: Story = {
  name: "Plusieurs par vue",
  render: () => (
    <div style={{ display: "grid", gap: 32, maxWidth: 820 }}>
      <Carousel aria-label="Albums" slidesPerView={1.15} spacing={3} opts={{ align: "start" }} style={{ maxWidth: 380 }}>
        <CarouselContent>
          {PHOTOS.map((photo) => (
            <CarouselItem key={photo.title}>
              <AspectRatio ratio="4 / 3" style={{ borderRadius: "var(--ui-r-lg)" }}>
                <img src={photo.src} alt={photo.alt} draggable={false} />
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots />
      </Carousel>

      <Carousel aria-label="Fichiers récents" slidesPerView={4} spacing={3} opts={{ align: "start", slidesToScroll: "auto" }}>
        <CarouselContent>
          {[...FILES, ...FILES].map((file, i) => (
            <CarouselItem key={`${file.title}-${i}`}>
              <FileCard file={file} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
    </div>
  ),
};

function DotsDemo() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    const update = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap() + 1);
    };
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  return (
    <div style={{ maxWidth: 520 }}>
      <Carousel aria-label="Présentation du produit" setApi={setApi}>
        <CarouselContent>
          {["Importez", "Partagez", "Validez", "Archivez", "Retrouvez"].map((word, i) => (
            <CarouselItem key={word}>
              <div
                style={{
                  ...scene(PAIRS[i][0], PAIRS[i][1]),
                  display: "grid",
                  placeItems: "end start",
                  height: 200,
                  padding: 24,
                  boxSizing: "border-box",
                  borderRadius: "var(--ui-r-lg)",
                  color: "#fff",
                  font: "600 28px/1.1 var(--ui-font-sans)",
                  letterSpacing: "-0.02em",
                }}
              >
                {word}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
      <p style={{ margin: "4px 0 0", textAlign: "center", color: "var(--ui-fg-3)", font: "500 12.5px/1.4 var(--ui-font-sans)", fontVariantNumeric: "tabular-nums" }}>
        Diapositive {current} sur {count}
      </p>
    </div>
  );
}

/**
 * Points de pagination d'iOS : l'actif s'allonge en pilule, chacun est nommé
 * « Aller à la diapositive 3 ». Un seul arrêt de tabulation ; les flèches
 * changent de diapositive et le focus suit. Le compteur lit l'API (`setApi`).
 */
export const AvecPoints: Story = {
  name: "Avec points",
  render: () => <DotsDemo />,
};
