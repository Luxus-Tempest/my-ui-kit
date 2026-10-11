import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test as base, type Page } from "@playwright/test";

export type Mode = "light" | "dark" | "rtl";

export interface StoryEntry {
  id: string;
  title: string;
  name: string;
  tags: string[];
}

/**
 * Stories du Storybook construit. Comme le test-runner de Storybook, on ne
 * garde que celles qui portent le tag `test` (le défaut) : une story s'en
 * exclut avec `tags: ["!test"]`. `skip-visual` retire seulement la capture.
 */
export function listStories(): StoryEntry[] {
  const index = JSON.parse(readFileSync(fileURLToPath(new URL("../storybook-static/index.json", import.meta.url)), "utf8")) as {
    entries: Record<string, StoryEntry & { type: string }>;
  };
  const only = process.env.STORIES ? new RegExp(process.env.STORIES) : null;
  return Object.values(index.entries).filter(
    (e) => e.type === "story" && e.tags.includes("test") && (!only || only.test(e.id)),
  );
}

/** Le mode du projet Playwright (clair, sombre, RTL), exposé aux tests. */
export const test = base.extend<{ mode: Mode }>({
  mode: ["light", { option: true }],
});

/** Date fixe : calendriers, « Aujourd'hui », horodatages relatifs restent identiques d'un passage à l'autre. */
const NOW = new Date("2026-10-12T10:00:00+01:00");

/** Ouvre une story seule (iframe) dans le mode voulu et attend qu'elle soit rendue, polices comprises. */
export async function openStory(page: Page, id: string, mode: Mode) {
  await page.clock.setFixedTime(NOW);
  const globals = mode === "rtl" ? "theme:light;dir:rtl" : `theme:${mode};dir:ltr`;
  await page.goto(`/iframe.html?id=${encodeURIComponent(id)}&viewMode=story&globals=${globals}`);
  await page.waitForFunction(() =>
    ["sb-show-main", "sb-show-errordisplay", "sb-show-nopreview"].some((c) => document.body.classList.contains(c)),
  );
  const error = await page.evaluate(() =>
    document.body.classList.contains("sb-show-errordisplay") ? document.querySelector("#error-message")?.textContent ?? "erreur" : null,
  );
  if (error) throw new Error(`La story « ${id} » ne se rend pas : ${error}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
}
