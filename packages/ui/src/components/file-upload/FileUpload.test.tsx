import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Field } from "../field/Field";
import {
  Dropzone,
  FileUploadItem,
  FileUploadList,
  formatFileSize,
  getFileKind,
  isFileAccepted,
} from "./FileUpload";

const MO = 1024 * 1024;

function makeFile(name: string, size: number, type: string) {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

/** jsdom n'a pas de DataTransfer : un objet qui en a la forme suffit. */
function transfer(files: File[]) {
  return {
    files,
    items: files.map((file) => ({ kind: "file", type: file.type, getAsFile: () => file })),
    types: ["Files"],
    dropEffect: "none",
  };
}

describe("formatFileSize", () => {
  it("formate à la française, unité insécable", () => {
    expect(formatFileSize(0)).toBe("0 o");
    expect(formatFileSize(512)).toBe("512 o");
    expect(formatFileSize(1536)).toBe("1,5 Ko");
    expect(formatFileSize(1.2 * MO)).toBe("1,2 Mo");
    expect(formatFileSize(10 * MO)).toBe("10 Mo");
    expect(formatFileSize(3 * 1024 * MO)).toBe("3 Go");
  });

  it("passe à l'unité suivante plutôt que d'afficher « 1 024 Ko »", () => {
    expect(formatFileSize(MO - 1)).toBe("1 Mo");
  });

  it("base décimale, décimales et valeurs invalides", () => {
    expect(formatFileSize(1_200_000, { base: 1000 })).toBe("1,2 Mo");
    expect(formatFileSize(1.234 * MO, { maximumFractionDigits: 2 })).toBe("1,23 Mo");
    expect(formatFileSize(-5)).toBe("0 o");
    expect(formatFileSize(Number.NaN)).toBe("0 o");
  });
});

describe("getFileKind / isFileAccepted", () => {
  it("reconnaît la famille par le type MIME puis l'extension", () => {
    expect(getFileKind({ name: "photo.heic", type: "" })).toBe("image");
    expect(getFileKind({ name: "x", type: "application/pdf" })).toBe("pdf");
    expect(getFileKind({ name: "budget.xlsx", type: "" })).toBe("spreadsheet");
    expect(getFileKind({ name: "notes", type: "text/plain" })).toBe("document");
    expect(getFileKind({ name: "inconnu.bin", type: "" })).toBe("file");
  });

  it("applique la syntaxe de <input accept>", () => {
    expect(isFileAccepted({ name: "a.PDF", type: "" }, ".pdf")).toBe(true);
    expect(isFileAccepted({ name: "a.png", type: "image/png" }, "image/*, .pdf")).toBe(true);
    expect(isFileAccepted({ name: "a.exe", type: "application/x-msdownload" }, ["image/*", ".pdf"])).toBe(false);
    expect(isFileAccepted({ name: "a.exe", type: "" }, undefined)).toBe(true);
  });
});

describe("Dropzone", () => {
  it("un Field le nomme, le décrit et le marque invalide", () => {
    render(
      <Field label="Justificatifs" hint="Factures du trimestre" error="Ajoutez au moins une facture.">
        <Dropzone accept="image/png,image/jpeg,.pdf" maxSize={10 * MO} />
      </Field>,
    );
    const input = screen.getByLabelText(/Justificatifs/);
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAccessibleName("Justificatifs Déposez vos fichiers ici");
    expect(input).toHaveAccessibleDescription(/PNG, JPG ou PDF · 10\sMo max\./);
    expect(input).toHaveAccessibleDescription(/Ajoutez au moins une facture\./);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.closest("[data-slot='dropzone']")).toHaveAttribute("data-invalid");
  });

  it("clavier : Tab atteint le champ ; un clic sur la zone ouvre le sélecteur", async () => {
    const user = userEvent.setup();
    render(<Dropzone />);
    const input = screen.getByLabelText("Déposez vos fichiers ici");
    await user.tab();
    expect(input).toHaveFocus();
    const open = vi.spyOn(input, "click");
    await user.click(screen.getByText("parcourez vos fichiers"));
    expect(open).toHaveBeenCalledOnce();
  });

  it("trie les fichiers choisis : type et taille, messages en français", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const onFilesAccepted = vi.fn();
    const onFilesRejected = vi.fn();
    render(
      <Dropzone
        accept=".pdf,image/*"
        maxSize={10 * MO}
        onFilesAccepted={onFilesAccepted}
        onFilesRejected={onFilesRejected}
      />,
    );
    const ok = makeFile("facture.pdf", 2 * MO, "application/pdf");
    const big = makeFile("scan.png", 20 * MO, "image/png");
    const exe = makeFile("setup.exe", MO, "application/x-msdownload");
    await user.upload(screen.getByLabelText("Déposez vos fichiers ici"), [ok, big, exe]);

    expect(onFilesAccepted).toHaveBeenCalledWith([ok]);
    expect(onFilesRejected).toHaveBeenCalledWith([
      { file: big, errors: [{ code: "file-too-large", message: "Fichier trop volumineux (max. 10 Mo)" }] },
      { file: exe, errors: [{ code: "file-invalid-type", message: "Format non accepté" }] },
    ]);
    expect(screen.getByRole("status")).toHaveTextContent(
      "1 fichier ajouté. 2 fichiers refusés : scan.png : Fichier trop volumineux (max. 10 Mo) ; setup.exe : Format non accepté",
    );
  });

  it("limite le nombre : maxFiles et multiple={false}", async () => {
    const user = userEvent.setup();
    const accepted = vi.fn();
    const rejected = vi.fn();
    const files = ["a.txt", "b.txt", "c.txt"].map((n) => makeFile(n, 10, "text/plain"));
    const { rerender } = render(<Dropzone maxFiles={2} onFilesAccepted={accepted} onFilesRejected={rejected} />);
    await user.upload(screen.getByLabelText("Déposez vos fichiers ici"), files);
    expect(accepted).toHaveBeenLastCalledWith(files.slice(0, 2));
    expect(rejected.mock.lastCall?.[0][0].errors[0]).toEqual({ code: "too-many-files", message: "Trop de fichiers (max. 2)" });

    rerender(<Dropzone multiple={false} onFilesAccepted={accepted} onFilesRejected={rejected} />);
    const zone = document.querySelector("[data-slot='dropzone']")!;
    fireEvent.drop(zone, { dataTransfer: transfer(files.slice(0, 2)) });
    expect(accepted).toHaveBeenLastCalledWith([files[0]]);
    expect(rejected.mock.lastCall?.[0][0].errors[0].message).toBe("Un seul fichier à la fois");
  });

  it("glisser-déposer : conteneur de sélection, refus anticipé, dépôt", () => {
    const onFilesAccepted = vi.fn();
    render(<Dropzone accept="image/*" onFilesAccepted={onFilesAccepted} />);
    const zone = document.querySelector<HTMLElement>("[data-slot='dropzone']")!;
    const photo = makeFile("photo.png", 1000, "image/png");

    fireEvent.dragEnter(zone, { dataTransfer: transfer([photo]) });
    expect(zone).toHaveAttribute("data-drag", "accept");
    expect(zone).toHaveTextContent("Relâchez pour importer");
    fireEvent.dragLeave(zone, { dataTransfer: transfer([photo]) });
    expect(zone).not.toHaveAttribute("data-drag");

    const doc = makeFile("contrat.docx", 1000, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    fireEvent.dragEnter(zone, { dataTransfer: transfer([doc]) });
    expect(zone).toHaveAttribute("data-drag", "reject");
    expect(zone).toHaveTextContent("Format non accepté");

    fireEvent.drop(zone, { dataTransfer: transfer([photo]) });
    expect(zone).not.toHaveAttribute("data-drag");
    expect(onFilesAccepted).toHaveBeenCalledWith([photo]);
  });

  it("désactivée : champ désactivé, dépôt ignoré", () => {
    const onFilesAccepted = vi.fn();
    render(<Dropzone disabled onFilesAccepted={onFilesAccepted} />);
    const zone = document.querySelector<HTMLElement>("[data-slot='dropzone']")!;
    expect(screen.getByLabelText("Déposez vos fichiers ici")).toBeDisabled();
    fireEvent.dragEnter(zone, { dataTransfer: transfer([makeFile("a.txt", 1, "text/plain")]) });
    expect(zone).not.toHaveAttribute("data-drag");
    fireEvent.drop(zone, { dataTransfer: transfer([makeFile("a.txt", 1, "text/plain")]) });
    expect(onFilesAccepted).not.toHaveBeenCalled();
  });

  it("compacte : bouton « Parcourir » décoratif, le champ garde son nom", () => {
    render(<Dropzone variant="compact" accept=".csv" />);
    const input = screen.getByLabelText("Glissez vos fichiers ici");
    expect(input).toHaveAccessibleDescription("CSV");
    expect(screen.getByText("Parcourir")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <>
        <Field label="Pièces jointes" hint="Jusqu'à 5 fichiers">
          <Dropzone accept="image/*,.pdf" maxSize={10 * MO} maxFiles={5} />
        </Field>
        <Field label="Relevé bancaire" error="Le relevé est obligatoire.">
          <Dropzone variant="compact" accept=".csv" />
        </Field>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("FileUploadList / FileUploadItem", () => {
  it("ligne importée : nom complet, type et taille, retrait au clavier", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <FileUploadList aria-label="Fichiers joints">
        <FileUploadItem name="rapport-annuel-2026-version-finale.pdf" size={1.2 * MO} onRemove={onRemove} />
      </FileUploadList>,
    );
    const item = within(screen.getByRole("list", { name: "Fichiers joints" })).getByRole("listitem");
    expect(item).toHaveAttribute("data-kind", "pdf");
    expect(item).toHaveAttribute("data-status", "done");
    expect(item).toHaveTextContent("rapport-annuel-2026-version-finale.pdf");
    expect(item).toHaveTextContent("PDF · 1,2 Mo");
    expect(item).toHaveTextContent("Importé");
    // Troncature au milieu : la fin du nom (extension comprise) reste entière.
    expect(item.querySelector(".ui-file-upload-item__name-end")).toHaveTextContent("finale.pdf");

    await user.tab();
    const remove = screen.getByRole("button", { name: "Retirer rapport-annuel-2026-version-finale.pdf" });
    expect(remove).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("envoi : barre de progression nommée, le retrait devient « Annuler l'envoi »", () => {
    render(
      <FileUploadList aria-label="Envois">
        <FileUploadItem name="photo.png" size={3 * MO} status="uploading" progress={42} onRemove={() => {}} />
        <FileUploadItem name="video.mp4" status="uploading" />
      </FileUploadList>,
    );
    const bar = screen.getByRole("progressbar", { name: "Envoi de photo.png" });
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(screen.getByText("42 %")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Annuler l'envoi de photo.png" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Envoi de video.mp4" })).toHaveAttribute("data-state", "indeterminate");
  });

  it("échec : message et « Réessayer » au clavier", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <FileUploadList aria-label="Envois">
        <FileUploadItem name="devis.docx" size={48_000} status="error" error="Connexion perdue" onRetry={onRetry} />
      </FileUploadList>,
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("Connexion perdue");
    const retry = screen.getByRole("button", { name: "Réessayer l'envoi de devis.docx" });
    expect(retry).toHaveTextContent("Réessayer");
    await user.tab();
    expect(retry).toHaveFocus();
    await user.keyboard(" ");
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("miniature d'une image : URL locale créée puis révoquée", () => {
    const create = vi.fn(() => "blob:apercu");
    const revoke = vi.fn();
    const original = { create: URL.createObjectURL, revoke: URL.revokeObjectURL };
    URL.createObjectURL = create;
    URL.revokeObjectURL = revoke;
    try {
      const photo = makeFile("vacances.jpg", 2 * MO, "image/jpeg");
      const { container, unmount } = render(
        <FileUploadList aria-label="Photos">
          <FileUploadItem file={photo} />
        </FileUploadList>,
      );
      expect(create).toHaveBeenCalledWith(photo);
      expect(container.querySelector("img")).toHaveAttribute("src", "blob:apercu");
      expect(screen.getByRole("listitem")).toHaveTextContent("JPG · 2 Mo");
      unmount();
      expect(revoke).toHaveBeenCalledWith("blob:apercu");
    } finally {
      URL.createObjectURL = original.create;
      URL.revokeObjectURL = original.revoke;
    }
  });

  it("pièces jointes compactes : variante héritée de la liste, relance en icône", () => {
    render(
      <FileUploadList variant="chip" aria-label="Pièces jointes">
        <FileUploadItem name="budget.xlsx" size={24_000} onRemove={() => {}} />
        <FileUploadItem name="plan.pdf" status="error" error="Trop lourd" onRetry={() => {}} />
      </FileUploadList>,
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveAttribute("data-variant", "chip");
    expect(items[0]).toHaveAttribute("data-kind", "spreadsheet");
    expect(screen.getByRole("button", { name: "Réessayer l'envoi de plan.pdf" })).not.toHaveTextContent("Réessayer");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <>
        <FileUploadList aria-label="Fichiers">
          <FileUploadItem name="contrat.pdf" size={MO} onRemove={() => {}} />
          <FileUploadItem name="photo.png" size={MO} status="uploading" progress={30} onRemove={() => {}} />
          <FileUploadItem name="devis.docx" size={MO} status="error" onRetry={() => {}} onRemove={() => {}} />
        </FileUploadList>
        <FileUploadList variant="chip" aria-label="Pièces jointes">
          <FileUploadItem name="budget.xlsx" size={MO} onRemove={() => {}} />
          <FileUploadItem name="note.txt" size={MO} status="uploading" />
        </FileUploadList>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
