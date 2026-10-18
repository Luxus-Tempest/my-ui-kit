import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { REFUSAL_PORT } from "../playwright.config";

/** Erreurs de la console pendant le test (hydratation, React, réseau). */
function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function expectAccessible(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.map((v) => `${v.id} : ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
}

async function signIn(page: Page, email = "nadia@exemple.ma") {
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill("motdepasse");
  await page.getByRole("button", { name: "Se connecter" }).click();
}

/** Attend la fin de la redirection après connexion : une navigation lancée avant serait annulée. */
async function signedIn(page: Page, path: RegExp) {
  await expect(page).toHaveURL(path);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.waitForLoadState("networkidle");
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`thème ${theme}`, () => {
    test.use({ colorScheme: theme });

    for (const path of ["/", "/connexion", "/inscription", "/page-inconnue"]) {
      test(`${path} s'affiche, accessible, sans erreur`, async ({ page }) => {
        const errors = watchConsole(page);
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        await expectAccessible(page);
        // La 404 du document est elle même journalisée par le navigateur : attendu pour cette route.
        const expected = path === "/page-inconnue" ? (e: string) => !/status of 404/.test(e) : () => true;
        expect(errors.filter(expected)).toEqual([]);
      });
    }

    test("pages de l'application, après connexion", async ({ page }) => {
      const errors = watchConsole(page);
      await page.goto("/tableau-de-bord");
      await expect(page).toHaveURL(/\/connexion\?suivant=%2Ftableau-de-bord/);
      await signIn(page);
      await signedIn(page, /\/tableau-de-bord$/);
      for (const path of ["/tableau-de-bord", "/parametres"]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        await expectAccessible(page);
      }
      expect(errors).toEqual([]);
    });
  });
}

test("retour à la page demandée, et pas vers un autre site", async ({ page }) => {
  await page.goto("/parametres");
  await signIn(page);
  await signedIn(page, /\/parametres$/);
  await page.context().clearCookies();
  await page.goto("/connexion?suivant=%2F%2Fexemple.com");
  await signIn(page);
  await expect(page).toHaveURL(/\/tableau-de-bord$/);
});

test("arabe : de droite à gauche dès le rendu serveur", async ({ page }) => {
  await page.context().addCookies([{ name: "locale", value: "ar", url: "http://localhost" }]);
  const response = await page.request.get("/connexion");
  expect(await response.text()).toContain('dir="rtl"');
  await page.goto("/connexion");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
});

test("thème sombre et langue depuis la coque, puis déconnexion", async ({ page }) => {
  await page.goto("/connexion");
  await signIn(page);
  await page.getByRole("button", { name: "Changer de thème" }).click();
  await page.getByRole("menuitemradio", { name: "Thème sombre" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: /^Langue/ }).click();
  await page.getByRole("menuitemradio", { name: "English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: /Nadia/ }).click();
  await page.getByRole("menuitem", { name: "Se déconnecter" }).click();
  await expect(page).toHaveURL(/\/connexion$/);
});

test("palette ⌘K : aller à une page", async ({ page }) => {
  await page.goto("/connexion");
  await signIn(page);
  // Le bouton de la barre d'application ; au clavier, ⌘K (Ctrl+K) fait de même.
  await page.getByRole("button", { name: "Rechercher une page ou une action" }).click();
  await page.getByPlaceholder("Aller à, changer de thème, de langue…").fill("Paramètres");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/parametres$/);
});

test("en production sans AUTH_DEMO, la démonstration refuse la connexion", async ({ page }) => {
  await page.goto(`http://localhost:${REFUSAL_PORT}/connexion`);
  await signIn(page);
  await expect(page.getByText("Branche ton fournisseur d'authentification dans lib/auth.ts.")).toBeVisible();
});
