import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Alert, AlertDescription, AlertTitle } from "./Alert";
import { Spinner } from "../spinner/Spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs/Tabs";

describe("Alert, Spinner, Tabs", () => {
  it("seules les alertes warn et err sont annoncées", () => {
    render(
      <>
        <Alert tone="pri"><AlertTitle>Nouveau</AlertTitle></Alert>
        <Alert tone="err"><AlertTitle>Échec de la synchronisation</AlertTitle></Alert>
      </>,
    );
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByRole("alert")).toHaveTextContent("Échec de la synchronisation");
  });

  it("icône masquable", () => {
    const { container } = render(<Alert icon={false}><AlertDescription>Texte</AlertDescription></Alert>);
    expect(container.querySelector(".ui-alert__icon")).toBeNull();
  });

  it("le spinner est un statut nommé, ou décoratif sans libellé", () => {
    render(<><Spinner /><Spinner label="" data-testid="deco" /></>);
    expect(screen.getByRole("status", { name: "Chargement" })).toBeInTheDocument();
    expect(screen.getByTestId("deco")).toHaveAttribute("aria-hidden", "true");
  });

  it("les onglets se parcourent aux flèches", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Vues">
          <TabsTrigger value="a">Factures</TabsTrigger>
          <TabsTrigger value="b">Avoirs</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Liste des factures</TabsContent>
        <TabsContent value="b">Liste des avoirs</TabsContent>
      </Tabs>,
    );
    await user.click(screen.getByRole("tab", { name: "Factures" }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Avoirs" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Liste des avoirs");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <>
        <Alert tone="warn"><AlertTitle>Échéance proche</AlertTitle><AlertDescription>3 factures à relancer.</AlertDescription></Alert>
        <Tabs defaultValue="a">
          <TabsList variant="segmented" aria-label="Période">
            <TabsTrigger value="a">Mois</TabsTrigger>
            <TabsTrigger value="b">Année</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Mensuel</TabsContent>
        </Tabs>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
