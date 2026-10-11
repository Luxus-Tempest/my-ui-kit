/*
 * Thème à partir d'une couleur de marque : la famille primaire (bouton plein,
 * conteneur tonal, sélection, liens, focus) calculée en OKLCH pour le clair et
 * le sombre, avec des contrastes garantis (WCAG 2.2, AA) :
 * - texte sur le primaire plein (`pri-fg` / `pri`) ≥ 4,5:1 ;
 * - primaire employé comme texte (liens) sur le panneau ≥ 4,5:1 ;
 * - texte sur le conteneur primaire (`on-pri-container` / `pri-container`) ≥ 7:1.
 * La teinte de la marque est conservée ; seules la luminosité et la saturation
 * s'adaptent (une marque jaune vif donne un bouton ambré lisible).
 */

/** Jetons de la famille primaire, sans le préfixe `--ui-`. */
export interface BrandTokens {
  pri: string;
  "pri-d": string;
  "pri-fg": string;
  "pri-soft": string;
  "pri-line": string;
  "pri-container": string;
  "on-pri-container": string;
  sel: string;
  "sh-pri": string;
}

type Rgb = [number, number, number];
interface Oklch {
  l: number;
  c: number;
  h: number;
}

/* ── Conversions ─────────────────────────────────────────────────── */

function parseColor(input: string): Rgb {
  const value = input.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(value);
  if (hex) {
    const digits = hex[1]!.length === 3 ? [...hex[1]!].map((d) => d + d).join("") : hex[1]!;
    return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16) / 255) as Rgb;
  }
  const rgb = /^rgba?\(\s*(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)/.exec(value);
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map((v) => Math.min(255, Number(v)) / 255) as Rgb;
  throw new Error(`Couleur de marque illisible : « ${input} » (attendu : #rrggbb, #rgb ou rgb(r g b)).`);
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function rgbToOklch([r, g, b]: Rgb): Oklch {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(A, B), h: (Math.atan2(B, A) * 180) / Math.PI };
}

/** Linéaire, non borné : sert à savoir si la couleur tient dans sRGB. */
function oklchToLinear({ l, c, h }: Oklch): Rgb {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

const inGamut = (rgb: Rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/** Ramène la couleur dans sRGB en baissant la saturation, à luminosité et teinte constantes. */
function toRgb(color: Oklch): Rgb {
  let { c } = color;
  if (!inGamut(oklchToLinear(color))) {
    let lo = 0;
    let hi = c;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear({ ...color, c: mid }))) lo = mid;
      else hi = mid;
    }
    c = lo;
  }
  // Arrondi sur 8 bits : la couleur mesurée est exactement celle de l'hexadécimal livré.
  return oklchToLinear({ ...color, c }).map((v) => Math.round(Math.min(1, Math.max(0, toGamma(Math.min(1, Math.max(0, v))))) * 255) / 255) as Rgb;
}

const toHex = (rgb: Rgb) => `#${rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("")}`;

function luminance(rgb: Rgb) {
  const [r, g, b] = rgb.map(toLinear) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Rapport de contraste WCAG entre deux couleurs (1 à 21). */
export function contrastRatio(a: string, b: string): number {
  const [la, lb] = [luminance(parseColor(a)), luminance(parseColor(b))];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Luminosité la plus proche de `color.l` qui atteint `target` contre `against`,
 * en assombrissant (`direction: "darker"`) ou en éclaircissant.
 */
function withContrast(color: Oklch, against: Rgb, target: number, direction: "darker" | "lighter"): Rgb {
  const ok = (l: number) => {
    const rgb = toRgb({ ...color, l });
    const [la, lb] = [luminance(rgb), luminance(against)];
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05) >= target;
  };
  if (ok(color.l)) return toRgb(color);
  let lo = direction === "darker" ? 0 : color.l;
  let hi = direction === "darker" ? color.l : 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (direction === "darker") {
      if (ok(mid)) lo = mid;
      else hi = mid;
    } else if (ok(mid)) hi = mid;
    else lo = mid;
  }
  return toRgb({ ...color, l: direction === "darker" ? lo : hi });
}

/* ── Familles claire et sombre ───────────────────────────────────── */

const WHITE: Rgb = [1, 1, 1];
/**
 * Surfaces les plus défavorables où le primaire sert de texte (liens) : la
 * carte tonale claire (`--ui-card-2`, #f0f4f9) et la carte sombre (#26282b).
 */
const LIGHT_SURFACE: Rgb = parseColor("#f0f4f9");
const DARK_SURFACE: Rgb = parseColor("#26282b");

const rgba = (rgb: Rgb, alpha: number) => `rgba(${rgb.map((v) => Math.round(v * 255)).join(", ")}, ${alpha})`;

function lightTokens(brand: Oklch): BrandTokens {
  const { c, h } = brand;
  // Primaire plein : la couleur de marque, assombrie si le texte blanc ne s'y lit pas.
  const onWhite = withContrast({ l: Math.min(brand.l, 0.62), c, h }, WHITE, 4.5, "darker");
  const pri = withContrast({ ...rgbToOklch(onWhite), h }, LIGHT_SURFACE, 4.5, "darker");
  const priL = rgbToOklch(pri).l;
  const container = toRgb({ l: 0.92, c: Math.min(c * 0.5, 0.075), h });
  const onContainer = withContrast({ l: 0.3, c: Math.min(c * 0.7, 0.11), h }, container, 7, "darker");
  return {
    pri: toHex(pri),
    "pri-d": toHex(toRgb({ l: Math.max(0.2, priL - 0.08), c, h })),
    "pri-fg": "#ffffff",
    "pri-soft": toHex(toRgb({ l: 0.965, c: Math.min(c * 0.22, 0.025), h })),
    "pri-line": toHex(toRgb({ l: 0.87, c: Math.min(c * 0.45, 0.065), h })),
    "pri-container": toHex(container),
    "on-pri-container": toHex(onContainer),
    sel: toHex(container),
    "sh-pri": `0 1px 2px ${rgba(pri, 0.24)}`,
  };
}

function darkTokens(brand: Oklch): BrandTokens {
  const { c, h } = brand;
  // Sur fond sombre, le primaire s'éclaircit (liens lisibles sur le panneau) et son texte s'assombrit.
  const pri = withContrast({ l: Math.max(brand.l, 0.8), c: Math.min(c * 0.75, 0.13), h }, DARK_SURFACE, 4.5, "lighter");
  const priL = rgbToOklch(pri).l;
  const priFg = withContrast({ l: 0.3, c: Math.min(c * 0.8, 0.12), h }, pri, 4.5, "darker");
  const container = toRgb({ l: 0.37, c: Math.min(c * 0.6, 0.1), h });
  const onContainer = withContrast({ l: 0.92, c: Math.min(c * 0.35, 0.05), h }, container, 7, "lighter");
  return {
    pri: toHex(pri),
    "pri-d": toHex(toRgb({ l: Math.min(0.95, priL + 0.05), c: Math.min(c * 0.6, 0.1), h })),
    "pri-fg": toHex(priFg),
    "pri-soft": toHex(toRgb({ l: 0.27, c: Math.min(c * 0.3, 0.04), h })),
    "pri-line": toHex(toRgb({ l: 0.38, c: Math.min(c * 0.4, 0.06), h })),
    "pri-container": toHex(container),
    "on-pri-container": toHex(onContainer),
    sel: toHex(container),
    "sh-pri": "0 1px 2px rgba(0, 0, 0, 0.4)",
  };
}

/**
 * Famille primaire d'une couleur de marque, pour le clair et le sombre. Les
 * clés se passent telles quelles à `ThemeProvider overrides` ou deviennent des
 * propriétés `--ui-<clé>` (voir `createBrandCss`).
 *
 *   createBrandTokens("#7c3aed").light.pri // "#7c3aed" (déjà lisible en blanc)
 */
export function createBrandTokens(color: string): { light: BrandTokens; dark: BrandTokens } {
  const brand = rgbToOklch(parseColor(color));
  return { light: lightTokens(brand), dark: darkTokens(brand) };
}

export interface BrandCssOptions {
  /** Sélecteur du thème clair. `:root, [data-theme="light"]` par défaut. */
  light?: string;
  /** Sélecteur du thème sombre. `[data-theme="dark"], .dark` par défaut (ThemeProvider et next-themes). */
  dark?: string;
}

/**
 * Feuille de style de la marque, à poser après `@acme/ui/styles.css` (balise
 * `<style>` ou fichier) : utile sans ThemeProvider, avec next-themes par exemple.
 */
export function createBrandCss(color: string, options: BrandCssOptions = {}): string {
  const { light = ':root, [data-theme="light"]', dark = '[data-theme="dark"], .dark' } = options;
  const tokens = createBrandTokens(color);
  const block = (selector: string, values: BrandTokens) =>
    `${selector} {\n${Object.entries(values)
      .map(([key, value]) => `  --ui-${key}: ${value};`)
      .join("\n")}\n}`;
  return `${block(light, tokens.light)}\n${block(dark, tokens.dark)}\n`;
}

/** Les jetons en propriétés CSS (`{ "--ui-pri": … }`), pour un `style` React. */
export function brandStyle(tokens: BrandTokens): Record<`--ui-${string}`, string> {
  return Object.fromEntries(Object.entries(tokens).map(([key, value]) => [`--ui-${key}`, value])) as Record<`--ui-${string}`, string>;
}
