"use client";

import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  DataTable,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Dropzone,
  FileUploadItem,
  FileUploadList,
  MenuItem,
  MenuSeparator,
  actionsColumn,
  createColumnHelper,
  dataTableFormatters,
  formatFileSize,
  toast,
  type BadgeVariant,
  type ColumnDef,
  type DataTableFilterOption,
} from "@acme/ui";
import { Download, FileImage, FileSpreadsheet, FileText, Presentation, Share2, Trash2, Upload } from "lucide-react";
import type { Document, StatutDocument, TypeDocument } from "@/lib/donnees";

const ICONES: Record<TypeDocument, React.ReactNode> = {
  pdf: <FileText style={{ color: "var(--ui-c2)" }} />,
  docx: <FileText style={{ color: "var(--ui-c1)" }} />,
  xlsx: <FileSpreadsheet style={{ color: "var(--ui-c3)" }} />,
  pptx: <Presentation style={{ color: "var(--ui-c4)" }} />,
  image: <FileImage style={{ color: "var(--ui-c5)" }} />,
};
const STATUTS: Record<StatutDocument, { label: string; tone: BadgeVariant }> = {
  indexe: { label: "Indexé", tone: "ok" },
  en_cours: { label: "En cours", tone: "pri" },
  erreur: { label: "Erreur", tone: "err" },
};

const formatDate = dataTableFormatters.date();
const col = createColumnHelper<Document>();

function options(values: string[]): DataTableFilterOption[] {
  return [...new Set(values)].sort().map((v) => ({ value: v, label: v }));
}

function useColumns(documents: Document[]) {
  return React.useMemo<ColumnDef<Document, any>[]>(
    () => [
      col.accessor("nom", {
        header: "Nom",
        cell: ({ row, getValue }) => (
          <span className="inline-flex items-center gap-2.5 font-medium [&_svg]:size-[18px]">
            {ICONES[row.original.type]}
            {getValue()}
          </span>
        ),
      }),
      col.accessor("dossier", { header: "Dossier", meta: { filterOptions: options(documents.map((d) => d.dossier)) } }),
      col.accessor("proprietaire", {
        header: "Propriétaire",
        cell: ({ getValue }) => (
          <span className="inline-flex items-center gap-2">
            <Avatar size="sm"><AvatarFallback name={getValue()} /></Avatar>
            {getValue()}
          </span>
        ),
        meta: { filterOptions: options(documents.map((d) => d.proprietaire)) },
      }),
      col.accessor("modifie", {
        header: "Modifié",
        sortingFn: "alphanumeric",
        meta: { format: (v: string) => formatDate(new Date(v)) },
      }),
      col.accessor("taille", { header: "Taille", meta: { numeric: true, format: (v: number) => formatFileSize(v) } }),
      col.accessor("statut", {
        header: "Statut",
        cell: ({ getValue }) => {
          const s = STATUTS[getValue<StatutDocument>()];
          return <Badge variant={s.tone} dot>{s.label}</Badge>;
        },
        meta: {
          format: (v: StatutDocument) => STATUTS[v].label,
          filterOptions: (Object.keys(STATUTS) as StatutDocument[]).map((k) => ({ value: k, label: STATUTS[k].label })),
        },
      }),
      actionsColumn<Document>((row) => (
        <>
          <MenuItem><Download />Télécharger</MenuItem>
          <MenuItem><Share2 />Partager</MenuItem>
          <MenuSeparator />
          <MenuItem variant="danger" onSelect={() => toast(`« ${row.original.nom} » placé dans la corbeille`)}>
            <Trash2 />Supprimer
          </MenuItem>
        </>
      )),
    ],
    [documents],
  );
}

function ImportDialog() {
  const [files, setFiles] = React.useState<File[]>([]);
  return (
    <Dialog onOpenChange={(open) => !open && setFiles([])}>
      <DialogTrigger asChild>
        <Button size="sm"><Upload />Importer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importer des documents</DialogTitle>
          <DialogDescription>Ils seront indexés et consultables par les agents.</DialogDescription>
        </DialogHeader>
        <Dropzone
          accept={[".pdf", ".docx", ".xlsx", ".pptx", "image/*"]}
          maxSize={25 * 1024 * 1024}
          onFilesAccepted={(added) => setFiles((list) => [...list, ...added])}
        />
        {files.length > 0 && (
          <FileUploadList aria-label="Fichiers à importer">
            {files.map((file, i) => (
              <FileUploadItem key={`${file.name}-${i}`} file={file} status="done" onRemove={() => setFiles((l) => l.filter((f) => f !== file))} />
            ))}
          </FileUploadList>
        )}
        <DialogFooter>
          <DialogClose asChild><Button variant="ghost">Annuler</Button></DialogClose>
          <DialogClose asChild>
            <Button disabled={files.length === 0} onClick={() => toast.success(`${files.length} document${files.length > 1 ? "s" : ""} importé${files.length > 1 ? "s" : ""}`)}>
              Importer
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DocumentsTable({ documents }: { documents: Document[] }) {
  const columns = useColumns(documents);
  return (
    <DataTable
      aria-label="Documents"
      columns={columns}
      data={documents}
      getRowId={(d) => d.id}
      getRowLabel={(d) => d.nom}
      enableRowSelection
      enableExport
      exportFilename="documents"
      initialState={{ sorting: [{ id: "modifie", desc: true }] }}
      toolbarActions={<ImportDialog />}
      bulkActions={({ selectedRows, clear }) => (
        <Button
          size="sm"
          variant="danger"
          onClick={() => {
            toast(`${selectedRows.length} document${selectedRows.length > 1 ? "s" : ""} placé${selectedRows.length > 1 ? "s" : ""} dans la corbeille`);
            clear();
          }}
        >
          <Trash2 />Supprimer
        </Button>
      )}
    />
  );
}
