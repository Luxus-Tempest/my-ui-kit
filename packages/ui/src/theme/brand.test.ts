import { brandStyle, contrastRatio, createBrandCss, createBrandTokens } from "./brand";

// Des marques faciles (bleu, violet) aux pièges : jaune vif, orange, presque noir, presque blanc, gris.
const MARQUES = ["#0b57d0", "#7c3aed", "#16a34a", "#fbbc04", "#f97316", "#dc2626", "#db2777", "#0d9488", "#111111", "#888888", "#f5f5f5"];
const HEX = /^#[0-9a-f]{6}$/;

/** Teinte OKLCH approximative, pour vérifier que la marque reste reconnaissable. */
function hue(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r!, g!, b!);
  const min = Math.min(r!, g!, b!);
  if (max === min) return null;
  const d = max - min;
  const h = max === r ? ((g! - b!) / d) % 6 : max === g ? (b! - r!) / d + 2 : (r! - g!) / d + 4;
  return (h * 60 + 360) % 360;
}

describe("createBrandTokens", () => {
  it.each(MARQUES)("%s : contrastes garantis en clair", (marque) => {
    const t = createBrandTokens(marque).light;
    for (const value of [t.pri, t["pri-d"], t["pri-soft"], t["pri-line"], t["pri-container"], t["on-pri-container"], t.sel]) {
      expect(value).toMatch(HEX);
    }
    expect(contrastRatio(t.pri, t["pri-fg"])).toBeGreaterThanOrEqual(4.5);
    // Primaire employé comme texte (liens) sur le panneau et sur la carte tonale.
    expect(contrastRatio(t.pri, "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.pri, "#f0f4f9")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t["on-pri-container"], t["pri-container"])).toBeGreaterThanOrEqual(7);
  });

  it.each(MARQUES)("%s : contrastes garantis en sombre", (marque) => {
    const t = createBrandTokens(marque).dark;
    expect(contrastRatio(t.pri, t["pri-fg"])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.pri, "#1c1d20")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.pri, "#26282b")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t["on-pri-container"], t["pri-container"])).toBeGreaterThanOrEqual(7);
  });

  it("une marque déjà lisible reste telle quelle ; une marque trop claire garde sa teinte", () => {
    expect(createBrandTokens("#7c3aed").light.pri).toBe("#7c3aed");
    expect(createBrandTokens("#0b57d0").light.pri).toBe("#0b57d0");
    // Jaune vif : assombri en ambre lisible, même famille de teinte.
    const jaune = createBrandTokens("#fbbc04").light.pri;
    expect(jaune).not.toBe("#fbbc04");
    expect(Math.abs(hue(jaune)! - hue("#fbbc04")!)).toBeLessThan(15);
  });

  it("couleurs acceptées : #rgb, #rrggbb, rgb() ; refus explicite sinon", () => {
    expect(createBrandTokens("#70e").light.pri).toMatch(HEX);
    expect(createBrandTokens("rgb(124 58 237)").light.pri).toBe("#7c3aed");
    expect(createBrandTokens("rgb(124, 58, 237)").light.pri).toBe("#7c3aed");
    expect(() => createBrandTokens("violet")).toThrow(/illisible/);
  });
});

describe("createBrandCss et brandStyle", () => {
  it("feuille de style : sélecteurs clair et sombre (ThemeProvider et next-themes)", () => {
    const css = createBrandCss("#7c3aed");
    expect(css).toContain(':root, [data-theme="light"] {');
    expect(css).toContain('[data-theme="dark"], .dark {');
    expect(css).toContain("--ui-pri: #7c3aed;");
    expect(css.match(/--ui-pri:/g)).toHaveLength(2);
    expect(createBrandCss("#7c3aed", { light: "#apercu", dark: "#apercu.dark" })).toContain("#apercu.dark {");
  });

  it("style React : propriétés --ui-*", () => {
    const style = brandStyle(createBrandTokens("#7c3aed").light);
    expect(style["--ui-pri"]).toBe("#7c3aed");
    expect(Object.keys(style).every((key) => key.startsWith("--ui-"))).toBe(true);
  });
});
