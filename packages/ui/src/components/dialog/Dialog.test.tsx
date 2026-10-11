import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button/Button";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "./Dialog";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "../alert-dialog/AlertDialog";

function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button>Ouvrir</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renommer le dossier</DialogTitle>
          <DialogDescription>Le nouveau nom s'applique à tous les membres.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild><Button variant="ghost">Annuler</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("s'ouvre, est étiqueté, se ferme avec Échap et rend le focus", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Ouvrir" }));
    const dialog = screen.getByRole("dialog", { name: "Renommer le dossier" });
    expect(dialog).toHaveAccessibleDescription("Le nouveau nom s'applique à tous les membres.");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ouvrir" })).toHaveFocus();
  });

  it("la croix « Fermer » ferme la modale", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Ouvrir" }));
    await user.click(screen.getByRole("button", { name: "Fermer" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("AlertDialog", () => {
  it("donne le focus à Annuler et confirme par l'action", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <AlertDialog>
        <AlertDialogTrigger asChild><Button variant="danger">Supprimer</Button></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la facture ?</AlertDialogTitle>
            <AlertDialogDescription>Elle sera retirée du grand livre.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogAction variant="destructive" onClick={onConfirm}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );
    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(screen.getByRole("alertdialog", { name: "Supprimer la facture ?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Annuler" })).toHaveFocus();
    await user.click(screen.getAllByRole("button", { name: "Supprimer" }).at(-1)!);
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
