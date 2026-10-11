import { existsSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";
import { listStories, openStory, test } from "./stories";

/*
 * Pour chaque story : une seule ouverture, puis
 * 1. axe (WCAG 2.2 A et AA), contraste compris, en clair et en sombre ;
 * 2. capture comparée à la référence, dans les trois modes.
 * `expect.soft` : un défaut d'accessibilité n'empêche pas la capture, et inversement.
 *
 *   pnpm --filter docs e2e                        tout
 *   STORIES=button pnpm --filter docs e2e         les stories dont l'id contient « button »
 *   VISUAL=0 pnpm --filter docs e2e               accessibilité seule
 *   pnpm --filter docs e2e --update-snapshots     nouvelles références visuelles
 */

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
// Règles de page, sans objet pour une story isolée dans l'iframe de Storybook.
const PAGE_RULES = ["html-has-lang", "document-title", "landmark-one-main", "page-has-heading-one", "region"];
// Comme dans vitest.setup.ts : gardes de focus de Radix, fond rendu inerte par une modale, proxy de
// focus du NavigationMenu. Éléments masqués et focalisables à dessein, pour piloter le focus.
const ARIA_HIDDEN_EXCEPTIONS = ["[data-radix-focus-guard]", '[data-aria-hidden="true"]', '.ui-navigation-menu__item > [aria-hidden="true"]'];

async function axeViolations(page: Page) {
  const main = await new AxeBuilder({ page }).withTags(WCAG).disableRules([...PAGE_RULES, "aria-hidden-focus"]).analyze();
  let hidden = new AxeBuilder({ page }).withRules(["aria-hidden-focus"]);
  for (const selector of ARIA_HIDDEN_EXCEPTIONS) hidden = hidden.exclude(selector);
  return [...main.violations, ...(await hidden.analyze()).violations];
}

for (const story of listStories()) {
  test(`${story.title} › ${story.name}`, async ({ page, mode }, testInfo) => {
    await openStory(page, story.id, mode);

    if (mode !== "rtl") {
      const report = (await axeViolations(page)).map((v) => ({
        règle: v.id,
        impact: v.impact,
        aide: v.help,
        éléments: v.nodes.slice(0, 5).map((n) => `${n.target.join(" ")} — ${n.failureSummary?.split("\n").slice(1).join(" ").trim()}`),
      }));
      expect.soft(report, `axe (${mode}) : ${story.id}`).toEqual([]);
    }

    if (process.env.VISUAL !== "0" && !story.tags.includes("skip-visual")) {
      const name = `${story.id}.png`;
      const reference = testInfo.snapshotPath(name, { kind: "screenshot" });
      if (existsSync(reference) || testInfo.config.updateSnapshots === "all") {
        await expect.soft(page).toHaveScreenshot(name, { fullPage: true });
      } else {
        // Nouvelle story : sa capture devient la référence, sans faire échouer le passage.
        await page.screenshot({ path: reference, fullPage: true, animations: "disabled", caret: "hide" });
        testInfo.annotations.push({ type: "référence créée", description: reference });
      }
    }
  });
}
