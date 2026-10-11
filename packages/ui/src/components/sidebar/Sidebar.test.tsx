import * as React from "react";
import { act, render, renderHook, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible/Collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
  type SidebarProps,
  type SidebarProviderProps,
} from "./Sidebar";

const Icon = () => <svg aria-hidden="true" />;

function Shell({
  provider,
  sidebar,
}: {
  provider?: Omit<SidebarProviderProps, "children">;
  sidebar?: SidebarProps;
}) {
  return (
    <SidebarProvider {...provider}>
      <Sidebar collapsible="icon" {...sidebar}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Acme">
                <Icon />
                <span>Acme</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Espace</SidebarGroupLabel>
            <SidebarGroupAction aria-label="Nouveau dossier">
              <Icon />
            </SidebarGroupAction>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip="Accueil">
                  <Icon />
                  <span>Accueil</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Récents">
                  <a href="#recents">
                    <Icon />
                    <span>Récents</span>
                  </a>
                </SidebarMenuButton>
                <SidebarMenuBadge>12</SidebarMenuBadge>
                <SidebarMenuAction showOnHover aria-label="Options de Récents">
                  <Icon />
                </SidebarMenuAction>
              </SidebarMenuItem>
              <Collapsible asChild>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Projets">
                      <Icon />
                      <span>Projets</span>
                      <Icon />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#refonte" isActive>
                          <span>Refonte</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator />
        </SidebarContent>
        <SidebarFooter>Compte</SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
        <p>Contenu</p>
      </SidebarInset>
    </SidebarProvider>
  );
}

/** Simule un écran étroit (< 768 px) le temps d'un test. */
function mockMobile(matches: boolean) {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

describe("Sidebar", () => {
  it("structure : repère de navigation nommé, groupe nommé, page courante annoncée", () => {
    render(<Shell />);
    const nav = screen.getByRole("navigation", { name: "Barre latérale" });
    const root = nav.parentElement!;
    expect(root).toHaveAttribute("data-slot", "sidebar");
    expect(root).toHaveAttribute("data-state", "expanded");
    expect(root).toHaveAttribute("data-variant", "inset");
    expect(root).toHaveAttribute("data-side", "left");
    expect(root).toHaveAttribute("data-collapsible", "icon");

    expect(within(nav).getByRole("group", { name: "Espace" })).toBeInTheDocument();
    const accueil = screen.getByRole("button", { name: "Accueil" });
    expect(accueil).toHaveAttribute("aria-current", "page");
    expect(accueil).toHaveAttribute("data-active", "true");

    // asChild : le lien reçoit le style et le comportement de l'entrée.
    const recents = screen.getByRole("link", { name: "Récents" });
    expect(recents).toHaveClass("ui-sidebar-menu-button");
    expect(recents).not.toHaveAttribute("type");
    expect(screen.getByRole("main")).toHaveClass("ui-sidebar-inset");
  });

  it("le déclencheur replie la barre et change de nom ; onOpenChange est appelé", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Shell provider={{ onOpenChange }} />);
    const root = screen.getByRole("navigation", { name: "Barre latérale" }).parentElement!;

    await user.click(screen.getByRole("button", { name: "Masquer la barre latérale" }));
    expect(root).toHaveAttribute("data-state", "collapsed");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    await user.click(screen.getByRole("button", { name: "Afficher la barre latérale" }));
    expect(root).toHaveAttribute("data-state", "expanded");
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it("clavier : ⌘B / Ctrl+B bascule la barre, Tab parcourt les entrées", async () => {
    const user = userEvent.setup();
    render(<Shell provider={{ defaultOpen: false }} />);
    const root = screen.getByRole("navigation", { name: "Barre latérale" }).parentElement!;
    expect(root).toHaveAttribute("data-state", "collapsed");

    await user.keyboard("{Control>}b{/Control}");
    expect(root).toHaveAttribute("data-state", "expanded");
    await user.keyboard("{Meta>}b{/Meta}");
    expect(root).toHaveAttribute("data-state", "collapsed");
    // Avec Maj ou sans modificateur : rien.
    await user.keyboard("{Control>}{Shift>}b{/Shift}{/Control}");
    await user.keyboard("b");
    expect(root).toHaveAttribute("data-state", "collapsed");

    await user.tab();
    expect(screen.getByRole("button", { name: "Acme" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Nouveau dossier" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Accueil" })).toHaveFocus();
  });

  it("raccourci désactivable, état contrôlé", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [open, setOpen] = React.useState(true);
      return <Shell provider={{ open, onOpenChange: setOpen, keyboardShortcut: false }} />;
    }
    render(<Controlled />);
    const root = screen.getByRole("navigation", { name: "Barre latérale" }).parentElement!;
    await user.keyboard("{Control>}b{/Control}");
    expect(root).toHaveAttribute("data-state", "expanded");
    await user.click(screen.getByRole("button", { name: "Masquer la barre latérale" }));
    expect(root).toHaveAttribute("data-state", "collapsed");
  });

  it("Entrée sur une entrée repliable déplie son sous-menu", async () => {
    const user = userEvent.setup();
    render(<Shell />);
    const projets = screen.getByRole("button", { name: "Projets" });
    expect(projets).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Refonte" })).toBeNull();
    act(() => projets.focus());
    await user.keyboard("{Enter}");
    expect(projets).toHaveAttribute("aria-expanded", "true");
    const refonte = screen.getByRole("link", { name: "Refonte" });
    expect(refonte).toBeVisible();
    expect(refonte).toHaveAttribute("aria-current", "page");
    expect(refonte).toHaveClass("ui-sidebar-menu-sub-button");
  });

  it("infobulles : seulement quand la barre est réduite en icônes", async () => {
    const user = userEvent.setup();
    render(<Shell />);
    act(() => screen.getByRole("button", { name: "Accueil" }).focus());
    expect(screen.queryByRole("tooltip")).toBeNull();

    await user.keyboard("{Control>}b{/Control}");
    act(() => screen.getByRole("button", { name: "Accueil" }).blur());
    act(() => screen.getByRole("button", { name: "Accueil" }).focus());
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Accueil");
  });

  it("pas d'infobulle en mode offcanvas, même réduite", async () => {
    render(<Shell provider={{ defaultOpen: false }} sidebar={{ collapsible: "offcanvas" }} />);
    act(() => screen.getByRole("button", { name: "Accueil", hidden: true }).focus());
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("petit écran : la barre devient une feuille modale, fermée par Échap ou par un lien", async () => {
    const restore = mockMobile(true);
    try {
      const user = userEvent.setup();
      render(<Shell />);
      expect(screen.queryByRole("navigation", { name: "Barre latérale" })).toBeNull();

      await user.click(screen.getByRole("button", { name: "Afficher la barre latérale" }));
      const dialog = screen.getByRole("dialog", { name: "Barre latérale" });
      expect(dialog).toHaveAttribute("data-mobile", "true");
      expect(within(dialog).getByRole("navigation", { name: "Barre latérale" })).toBeInTheDocument();
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).toBeNull();

      // Suivre un lien referme la feuille ; un déclencheur de sous-menu la laisse ouverte.
      await user.keyboard("{Control>}b{/Control}");
      await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Projets" }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      await user.click(within(screen.getByRole("dialog")).getByRole("link", { name: "Récents" }));
      expect(screen.queryByRole("dialog")).toBeNull();
    } finally {
      restore();
    }
  });

  it("collapsible none : toujours ouverte, même sur petit écran", () => {
    const restore = mockMobile(true);
    try {
      render(<Shell provider={{ defaultOpen: false }} sidebar={{ collapsible: "none", label: "Réglages" }} />);
      const root = screen.getByRole("navigation", { name: "Réglages" }).parentElement!;
      expect(root).toHaveAttribute("data-collapsible", "none");
      expect(root).toHaveAttribute("data-state", "expanded");
    } finally {
      restore();
    }
  });

  it("useSidebar : expose l'état et exige un SidebarProvider", () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => <SidebarProvider>{children}</SidebarProvider>,
    });
    expect(result.current.state).toBe("expanded");
    expect(result.current.isMobile).toBe(false);
    act(() => result.current.toggleSidebar());
    expect(result.current.open).toBe(false);
    act(() => result.current.setOpen((open) => !open));
    expect(result.current.state).toBe("expanded");

    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useSidebar())).toThrow(/SidebarProvider/);
    error.mockRestore();
  });

  it("sans violation d'accessibilité (ouverte, réduite, feuille mobile)", async () => {
    const user = userEvent.setup();
    const { container, unmount } = render(<Shell />);
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole("button", { name: "Masquer la barre latérale" }));
    expect(await axe(container)).toHaveNoViolations();
    unmount();

    const restore = mockMobile(true);
    try {
      render(<Shell />);
      await user.click(screen.getByRole("button", { name: "Afficher la barre latérale" }));
      expect(await axe(document.body)).toHaveNoViolations();
    } finally {
      restore();
    }
  });
});
