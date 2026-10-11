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
  Field,
  Input,
  MenuItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  actionsColumn,
  createColumnHelper,
  toast,
  type BadgeVariant,
  type ColumnDef,
} from "@acme/ui";
import { Ban, Mail, UserPlus } from "lucide-react";
import { inviter, type InvitationState } from "@/lib/actions";
import type { Role, StatutUtilisateur, Utilisateur } from "@/lib/donnees";

const ROLES: Record<Role, string> = { admin: "Administrateur", editeur: "Éditeur", lecteur: "Lecteur" };
const STATUTS: Record<StatutUtilisateur, { label: string; tone: BadgeVariant }> = {
  actif: { label: "Actif", tone: "ok" },
  invite: { label: "Invité", tone: "pri" },
  suspendu: { label: "Suspendu", tone: "neu" },
};
const dateCourte = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });

const col = createColumnHelper<Utilisateur>();
const COLUMNS: ColumnDef<Utilisateur, any>[] = [
  col.accessor("nom", {
    header: "Nom",
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-3">
        <Avatar><AvatarFallback name={row.original.nom} /></Avatar>
        <span className="grid">
          <span className="font-medium">{row.original.nom}</span>
          <span className="text-[13px] text-fg-3">{row.original.email}</span>
        </span>
      </span>
    ),
  }),
  col.accessor("departement", {
    header: "Département",
    meta: { filterOptions: ["Commercial", "Direction", "Finance", "Informatique", "Juridique", "RH"].map((d) => ({ value: d, label: d })) },
  }),
  col.accessor("role", {
    header: "Rôle",
    meta: {
      format: (v: Role) => ROLES[v],
      filterOptions: (Object.keys(ROLES) as Role[]).map((k) => ({ value: k, label: ROLES[k] })),
    },
  }),
  col.accessor("statut", {
    header: "Statut",
    cell: ({ getValue }) => {
      const s = STATUTS[getValue<StatutUtilisateur>()];
      return <Badge variant={s.tone} dot>{s.label}</Badge>;
    },
    meta: { format: (v: StatutUtilisateur) => STATUTS[v].label },
  }),
  col.accessor("derniereConnexion", {
    header: "Dernière connexion",
    meta: { format: (v: string | null) => (v ? dateCourte.format(new Date(v)) : "Jamais") },
  }),
  actionsColumn<Utilisateur>((row) => (
    <>
      <MenuItem><Mail />Renvoyer l'invitation</MenuItem>
      <MenuItem variant="danger" onSelect={() => toast(`Accès de ${row.original.nom} suspendu`)}><Ban />Suspendre</MenuItem>
    </>
  )),
];

const INITIAL: InvitationState = { ok: false, envoi: 0 };

function InviteDialog() {
  const [open, setOpen] = React.useState(false);
  const [state, action, pending] = React.useActionState(inviter, INITIAL);

  // Invitation acceptée par le serveur : on ferme et on l'annonce.
  React.useEffect(() => {
    if (state.envoi > 0 && state.message) {
      setOpen(false);
      toast.success(state.message);
    }
  }, [state.envoi, state.message]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><UserPlus />Inviter</Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action} className="grid gap-5" noValidate>
          <DialogHeader>
            <DialogTitle>Inviter un utilisateur</DialogTitle>
            <DialogDescription>Un courriel l'invitera à créer son compte.</DialogDescription>
          </DialogHeader>
          <Field label="Adresse e-mail" required error={state.erreurs?.email}>
            <Input name="email" type="email" placeholder="prenom@acme.ma" autoComplete="off" />
          </Field>
          <Field label="Rôle" required error={state.erreurs?.role} hint="Modifiable plus tard.">
            <Select name="role" defaultValue="lecteur">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLES) as Role[]).map((k) => (
                  <SelectItem key={k} value={k}>{ROLES[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="ghost">Annuler</Button></DialogClose>
            <Button type="submit" loading={pending}>Envoyer l'invitation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UsersTable({ utilisateurs }: { utilisateurs: Utilisateur[] }) {
  return (
    <DataTable
      aria-label="Utilisateurs"
      columns={COLUMNS}
      data={utilisateurs}
      getRowId={(u) => u.id}
      getRowLabel={(u) => u.nom}
      toolbarActions={<InviteDialog />}
    />
  );
}
