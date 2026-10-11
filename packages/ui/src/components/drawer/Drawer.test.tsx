import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type DrawerDirection,
} from "./Drawer";

function Demo({ direction, autoFocus }: { direction?: DrawerDirection; autoFocus?: boolean }) {
  return (
    <Drawer direction={direction} autoFocus={autoFocus}>
      <DrawerTrigger>Nouveau</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Nouveau</DrawerTitle>
          <DrawerDescription>Créer ou importer dans Mon Drive</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <button type="button">Dossier</button>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose>Annuler</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// jsdom ne calcule pas `transform` : vaul le lit au relâchement du pointeur.
beforeAll(() => {
  const original = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) => {
    const style = original(element, pseudo);
    if (!style.transform) Object.defineProperty(style, "transform", { value: "none", configurable: true });
    return style;
  });
});
afterAll(() => {
  vi.restoreAllMocks();
});

/** jsdom n'exécute pas d'animation : on signale la fin de la sortie à Radix. */
async function expectClosed() {
  await waitFor(() => {
    const dialog = screen.queryByRole("dialog");
    if (dialog) dialog.dispatchEvent(new Event("animationend"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
}

describe("Drawer", () => {
  it("s'ouvre au clavier en modale nommée et décrite, avec sa poignée", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    screen.getByRole("button", { name: "Nouveau" }).focus();
    await user.keyboard("{Enter}");
    const dialog = await screen.findByRole("dialog", { name: "Nouveau" });
    expect(dialog).toHaveAccessibleDescription("Créer ou importer dans Mon Drive");
    expect(dialog).toHaveAttribute("data-direction", "bottom");
    expect(dialog).toHaveAttribute("data-vaul-drawer-direction", "bottom");
    expect(dialog.querySelector(".ui-drawer__handle")).toHaveAttribute("aria-hidden", "true");
  });

  it("place le focus sur la feuille, le piège, et le rend au déclencheur après Échap", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    const trigger = screen.getByRole("button", { name: "Nouveau" });
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog).toHaveFocus());
    await user.tab();
    expect(screen.getByRole("button", { name: "Dossier" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Annuler" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Dossier" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await expectClosed();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("avec autoFocus, le focus va au premier élément focalisable", async () => {
    const user = userEvent.setup();
    render(<Demo autoFocus />);
    await user.click(screen.getByRole("button", { name: "Nouveau" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Dossier" })).toHaveFocus());
  });

  it("DrawerClose ferme la feuille", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole("button", { name: "Nouveau" }));
    await user.click(await screen.findByRole("button", { name: "Annuler" }));
    await expectClosed();
  });

  it("les feuilles latérales n'ont pas de poignée par défaut", async () => {
    const user = userEvent.setup();
    render(<Demo direction="right" />);
    await user.click(screen.getByRole("button", { name: "Nouveau" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("data-direction", "right");
    expect(dialog.querySelector(".ui-drawer__handle")).toBeNull();
  });

  it("sans violation d'accessibilité, ouverte", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole("button", { name: "Nouveau" }));
    expect(await axe(await screen.findByRole("dialog"))).toHaveNoViolations();
  });
});
