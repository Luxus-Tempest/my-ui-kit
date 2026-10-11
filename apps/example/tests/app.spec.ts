import { expect, test, type Page } from "@playwright/test";

/** Erreurs pendant le test : console (hydratation, rendu), exceptions, ressources en erreur avec leur URL. */
function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    // « Failed to load resource » ne dit pas laquelle : la réponse ci-dessous la nomme.
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${new URL(response.url()).pathname}`);
  });
  return errors;
}

for (const { path, heading } of [
  { path: "/", heading: "Bonjour Nadia" },
  { path: "/documents", heading: "Documents" },
  { path: "/utilisateurs", heading: "Utilisateurs" },
  { path: "/connexion", heading: "Connexion" },
]) {
  test(`${path} s'affiche et s'hydrate sans erreur`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(path);
    await expect(page.getByText(heading, { exact: true }).first()).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });
}

test("navigation latérale : la page courante est marquée", async ({ page }) => {
  await page.goto("/");
  const lien = page.getByRole("link", { name: "Documents", exact: true });
  await lien.click();
  await expect(page).toHaveURL(/\/documents$/);
  await expect(lien).toHaveAttribute("aria-current", "page");
});

test("documents : recherche dans la table", async ({ page }) => {
  await page.goto("/documents");
  const table = page.getByRole("table", { name: "Documents" });
  await page.getByRole("searchbox").fill("budget");
  await expect(table.getByRole("row").nth(1)).toContainText("Budget");
});

test("invitation : erreur du serveur dans le champ, puis envoi (server action)", async ({ page }) => {
  await page.goto("/utilisateurs");
  await page.getByRole("button", { name: "Inviter" }).click();
  const dialog = page.getByRole("dialog", { name: "Inviter un utilisateur" });
  const email = dialog.getByRole("textbox", { name: /Adresse e-mail/ });

  await email.fill("pas-un-email");
  await dialog.getByRole("button", { name: "Envoyer l'invitation" }).click();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(dialog.getByText("Saisissez une adresse e-mail valide.")).toBeVisible();

  await email.fill("salma@acme.ma");
  await dialog.getByRole("button", { name: "Envoyer l'invitation" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Invitation envoyée à salma@acme.ma")).toBeVisible();
});

test("thème : le choix sombre pose la classe dark", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Changer de thème" }).click();
  await page.getByRole("menuitemradio", { name: "Sombre" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});
