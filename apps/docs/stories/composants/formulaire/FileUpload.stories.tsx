import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Dropzone,
  Field,
  FileUploadItem,
  FileUploadList,
  Textarea,
  type FileRejection,
  type FileUploadStatus,
} from "@acme/ui";
import { ImageUp, Paperclip, Send } from "lucide-react";
import { Row } from "../../_shared/demo";

const MO = 1024 * 1024;

/* ── Données de démo ─────────────────────────────────────────────────── */

/** Vignette d'image générée (SVG en data-URI) : aucune ressource externe. */
function thumbnail(sky: [string, string], hills: [string, string]) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'>
    <defs><linearGradient id='c' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${sky[0]}'/><stop offset='1' stop-color='${sky[1]}'/></linearGradient></defs>
    <rect width='160' height='160' fill='url(#c)'/>
    <circle cx='112' cy='52' r='18' fill='#fff7e0' opacity='.9'/>
    <path d='M0 112c28-18 52-16 78-6s54 4 82-8v62H0z' fill='${hills[0]}'/>
    <path d='M0 132c34-14 66-12 96-2s44 6 64-2v32H0z' fill='${hills[1]}'/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const PHOTO_CHANTIER = thumbnail(["#9ec5f4", "#cde2fb"], ["#1baf7a", "#008300"]);
const PHOTO_MAQUETTE = thumbnail(["#6250d6", "#e87ba4"], ["#eb6834", "#2a78d6"]);

interface Upload {
  id: string;
  name: string;
  size: number;
  type?: string;
  file?: File;
  previewUrl?: string;
  status: FileUploadStatus;
  progress?: number;
  error?: string;
  /** Démo : l'envoi échoue à ce pourcentage. */
  failAt?: number;
  /** Démo : refus de la Dropzone, sans relance possible. */
  rejected?: boolean;
}

let uid = 0;
const nextId = () => `envoi-${(uid += 1)}`;

/**
 * Simule l'envoi au serveur : la progression avance par paliers irréguliers,
 * un fichier sur quatre échoue à 60 % (« Réessayer » le relance).
 */
function useSimulatedUploads(initial: Upload[]) {
  const [uploads, setUploads] = React.useState<Upload[]>(initial);
  const added = React.useRef(0);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setUploads((list) => {
        if (!list.some((u) => u.status === "uploading")) return list;
        return list.map((u) => {
          if (u.status !== "uploading") return u;
          const current = u.progress ?? 0;
          const progress = Math.min(100, current + 4 + ((u.name.length * 5 + current) % 13));
          if (u.failAt != null && progress >= u.failAt) {
            return { ...u, status: "error", progress: undefined, failAt: undefined, error: "Connexion interrompue" };
          }
          return progress >= 100 ? { ...u, status: "done", progress: undefined } : { ...u, progress };
        });
      });
    }, 320);
    return () => window.clearInterval(timer);
  }, []);

  const add = (files: File[]) =>
    setUploads((list) => [
      ...list,
      ...files.map((file): Upload => {
        added.current += 1;
        return {
          id: nextId(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: "uploading",
          progress: 0,
          failAt: added.current % 4 === 0 ? 60 : undefined,
        };
      }),
    ]);
  const reject = (rejections: FileRejection[]) =>
    setUploads((list) => [
      ...list,
      ...rejections.map(({ file, errors }): Upload => ({
        id: nextId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "error",
        error: errors.map((e) => e.message).join(" · "),
        rejected: true,
      })),
    ]);
  const retry = (id: string) =>
    setUploads((list) => list.map((u) => (u.id === id ? { ...u, status: "uploading", progress: 0, error: undefined } : u)));
  const remove = (id: string) => setUploads((list) => list.filter((u) => u.id !== id));

  return { uploads, add, reject, retry, remove };
}

function UploadRows({ api, variant }: { api: ReturnType<typeof useSimulatedUploads>; variant?: "row" | "chip" }) {
  if (api.uploads.length === 0) return null;
  return (
    <FileUploadList variant={variant} aria-label="Fichiers importés">
      {api.uploads.map((u) => (
        <FileUploadItem
          key={u.id}
          file={u.file}
          name={u.name}
          size={u.size}
          type={u.type}
          previewUrl={u.previewUrl}
          status={u.status}
          progress={u.progress}
          error={u.error}
          onRetry={u.rejected ? undefined : () => api.retry(u.id)}
          onRemove={() => api.remove(u.id)}
        />
      ))}
    </FileUploadList>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

const meta = {
  title: "Composants/Formulaire/FileUpload",
  component: Dropzone,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "L'import de fichiers de Drive. `Dropzone` reçoit les fichiers par glisser-déposer ou par le sélecteur du système (un `<input type=\"file\">` masqué mais focalisable : Tab, puis Entrée), les trie selon `accept`, `maxSize` et `maxFiles`, et rend `onFilesAccepted(files)` / `onFilesRejected(rejections)` avec des messages en français. `FileUploadList` et `FileUploadItem` affichent ensuite chaque fichier : pictogramme ou miniature, nom tronqué au milieu, taille (`formatFileSize`), progression, échec et « Réessayer », retrait. La variante `chip` en fait des pièces jointes de messagerie.",
      },
    },
  },
  args: { variant: "default", accept: "image/*,.pdf", maxSize: 10 * MO, multiple: true, disabled: false },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "compact"] },
    accept: { control: "text" },
    maxSize: { control: "number" },
    maxFiles: { control: "number" },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    onFilesAccepted: { action: "onFilesAccepted" },
    onFilesRejected: { action: "onFilesRejected" },
    labels: { table: { disable: true } },
    icon: { table: { disable: true } },
    inputRef: { table: { disable: true } },
    validator: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Dropzone {...args} />
    </div>
  ),
} satisfies Meta<typeof Dropzone>;
export default meta;
type Story = StoryObj<typeof meta>;

/** La zone seule : glisser des fichiers dessus, ou cliquer pour parcourir. Toutes les props sont dans les Contrôles. */
export const Playground: Story = {};

/** Une ligne : pastille, texte et bouton « Parcourir ». Pour un formulaire dense ou un panneau étroit. */
export const Compacte: Story = {
  args: { variant: "compact", accept: ".pdf,.docx", maxSize: 20 * MO },
};

function ListDemo() {
  const api = useSimulatedUploads([
    { id: nextId(), name: "maquette-accueil-v3.png", size: 2.4 * MO, type: "image/png", previewUrl: PHOTO_MAQUETTE, status: "uploading", progress: 18 },
    { id: nextId(), name: "contrat-de-prestation-2026-version-signée.pdf", size: 1.2 * MO, status: "uploading", progress: 64 },
    { id: nextId(), name: "budget-prévisionnel.xlsx", size: 86_000, status: "done" },
  ]);
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 560 }}>
      <Dropzone accept="image/*,.pdf,.xlsx,.docx" maxSize={25 * MO} onFilesAccepted={api.add} onFilesRejected={api.reject} />
      <UploadRows api={api} />
    </div>
  );
}

/**
 * L'import complet, comme le panneau de Drive : chaque fichier accepté part
 * aussitôt (progression simulée), un sur quatre échoue pour montrer
 * « Réessayer ». Pendant l'envoi, le bouton de retrait devient « Annuler l'envoi ».
 */
export const AvecListe: Story = {
  name: "Avec liste et progression",
  render: () => <ListDemo />,
};

function ErrorsDemo() {
  const api = useSimulatedUploads([
    { id: nextId(), name: "contrat-signé.exe", size: 740_000, status: "error", error: "Format non accepté", rejected: true },
    { id: nextId(), name: "visite-du-chantier.mov", size: 48 * MO, status: "error", error: "Fichier trop volumineux (max. 5 Mo)", rejected: true },
    { id: nextId(), name: "photo-façade-nord.jpg", size: 3.1 * MO, previewUrl: PHOTO_CHANTIER, status: "error", error: "Connexion interrompue" },
  ]);
  const refused = api.uploads.filter((u) => u.rejected).length;
  return (
    <div style={{ maxWidth: 560 }}>
      <Field
        label="Photos du chantier"
        hint="Les fichiers refusés restent listés avec leur motif."
        error={refused > 0 ? `${refused} fichier${refused > 1 ? "s" : ""} refusé${refused > 1 ? "s" : ""} : retirez-les ou remplacez-les.` : undefined}
      >
        <Dropzone accept="image/*" maxSize={5 * MO} maxFiles={4} onFilesAccepted={api.add} onFilesRejected={api.reject} />
      </Field>
      <div style={{ marginTop: 16 }}>
        <UploadRows api={api} />
      </div>
    </div>
  );
}

/**
 * Refus et échecs. La Dropzone refuse à la réception (« Format non accepté »,
 * « Fichier trop volumineux (max. 5 Mo) », « Trop de fichiers (max. 4) ») ;
 * un envoi interrompu propose « Réessayer ». Le `Field` résume l'erreur et
 * la zone passe en `aria-invalid`.
 */
export const Erreurs: Story = {
  render: () => <ErrorsDemo />,
};

function AttachmentsDemo() {
  const api = useSimulatedUploads([
    { id: nextId(), name: "photo-chantier.jpg", size: 2.1 * MO, type: "image/jpeg", previewUrl: PHOTO_CHANTIER, status: "done" },
    { id: nextId(), name: "devis-signé-atlas-distribution.pdf", size: 1.4 * MO, status: "uploading", progress: 30 },
    { id: nextId(), name: "planning-livraisons.xlsx", size: 42_000, status: "done" },
    { id: nextId(), name: "compte-rendu.docx", size: 120_000, status: "error", error: "Échec de l'envoi" },
  ]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        maxWidth: 600,
        padding: 12,
        borderRadius: "var(--ui-r-xl)",
        background: "var(--ui-panel)",
        boxShadow: "var(--ui-sh2)",
      }}
    >
      <UploadRows api={api} variant="chip" />
      <Textarea aria-label="Message" placeholder="Écrire un message…" autoResize rows={2} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Button variant="ghost" size="icon" aria-label="Joindre des fichiers" onClick={() => inputRef.current?.click()}>
          <Paperclip />
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(event) => {
            api.add(Array.from(event.currentTarget.files ?? []));
            event.currentTarget.value = "";
          }}
        />
        <Button style={{ marginLeft: "auto" }}>
          <Send />
          Envoyer
        </Button>
      </div>
    </div>
  );
}

/**
 * Pièces jointes d'un message : `FileUploadList variant="chip"`. Miniature
 * pour les images, mince barre pendant l'envoi, relance en icône. Le trombone
 * ouvre le sélecteur du système.
 */
export const PiecesJointes: Story = {
  name: "Pièces jointes (chips)",
  render: () => <AttachmentsDemo />,
};

/**
 * Dans un `Field` : le libellé nomme le champ fichier, l'aide et la ligne de
 * contraintes le décrivent, `error` et `disabled` se propagent.
 */
export const DansUnField: Story = {
  name: "Dans un Field",
  render: () => (
    <div style={{ display: "grid", gap: 24, maxWidth: 560 }}>
      <Field label="Justificatifs" hint="Factures et reçus du mois." required>
        <Dropzone accept="image/*,.pdf" maxSize={10 * MO} maxFiles={10} />
      </Field>
      <Field label="Relevé bancaire" error="Ajoutez le relevé de septembre.">
        <Dropzone variant="compact" accept=".csv,.ofx" maxSize={2 * MO} />
      </Field>
      <Field label="Pièce d'identité" hint="Disponible après validation du compte." disabled>
        <Dropzone variant="compact" accept="image/*,.pdf" />
      </Field>
    </div>
  ),
};

/**
 * Les états de la zone. « Survolée » et « Refus » sont des aperçus statiques
 * (`data-drag`) : en vrai, ils apparaissent pendant le glisser.
 */
export const Etats: Story = {
  name: "États",
  render: () => (
    <>
      <Row label="Au repos">
        <Dropzone style={{ width: 340 }} accept="image/*" maxSize={10 * MO} />
      </Row>
      <Row label="Survolée">
        <Dropzone style={{ width: 340 }} accept="image/*" maxSize={10 * MO} data-drag="accept" labels={{ title: "Relâchez pour importer" }} />
      </Row>
      <Row label="Refus">
        <Dropzone style={{ width: 340 }} accept="image/*" maxSize={10 * MO} data-drag="reject" labels={{ title: "Format non accepté" }} />
      </Row>
      <Row label="Désactivée">
        <Dropzone style={{ width: 340 }} accept="image/*" disabled />
      </Row>
    </>
  ),
};

/**
 * Libellés, pictogramme et contraintes sur mesure : une photo de profil,
 * un seul fichier (`multiple={false}`).
 */
export const Personnalisee: Story = {
  name: "Personnalisée",
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Dropzone
        accept="image/png,image/jpeg"
        maxSize={2 * MO}
        multiple={false}
        icon={<ImageUp />}
        description="Carré de préférence, PNG ou JPG · 2 Mo max."
        labels={{
          title: "Déposez votre photo de profil",
          dragActive: "Relâchez pour l'utiliser",
          browse: "ou choisissez une image",
        }}
      />
    </div>
  ),
};
