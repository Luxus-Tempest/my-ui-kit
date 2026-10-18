import * as React from "react";
import { Avatar, AvatarFallback } from "@rovia/ui/avatar";
import { Badge } from "@rovia/ui/badge";
import { Button } from "@rovia/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardMedia, CardTitle } from "@rovia/ui/card";
import { Chip, ChipGroup } from "@rovia/ui/chip";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@rovia/ui/command";
import { List, ListItem, ListItemIcon, ListSection } from "@rovia/ui/list";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@rovia/ui/menu";
import { Progress } from "@rovia/ui/progress";
import { SearchBar } from "@rovia/ui/search-bar";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@rovia/ui/sheet";
import { Switch } from "@rovia/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rovia/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@rovia/ui/toggle";
import { Tooltip } from "@rovia/ui/tooltip";
import { Heading, Kbd, Text } from "@rovia/ui/typography";
import {
  ClockIcon,
  CloudIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  FileIcon,
  FolderIcon,
  GridIcon,
  HomeIcon,
  MoreIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from "./icons";

/** Un fichier affiché en carte. `tint` : couleur de l'icône et du dégradé (`var(--ui-c3)`…). */
export interface DriveFile {
  id: string;
  name: string;
  /** Ligne d'information, « Auteur · date » ; la date sert aussi dans le panneau Détails. */
  meta: string;
  tint: string;
  size: string;
}

/** Une personne qui a accès aux fichiers, affichée dans le panneau Détails. */
export interface DriveCollaborator {
  initials: string;
  name: string;
  role: string;
}

export interface DriveProps {
  appName: string;
  /** Initiales de l'utilisateur connecté (avatar en haut à droite). */
  userInitials: string;
  files: DriveFile[];
  /** Filtres par type de fichier. */
  fileTypes: string[];
  /** Espace utilisé : pourcentage et libellé (« 3,2 Go utilisés sur 15 Go »). */
  storage: { percent: number; label: string };
  collaborators: DriveCollaborator[];
  /** Pastille à côté du titre (« 4 nouveautés ») ; rien si absent. */
  newItemsLabel?: string;
  /** Fichier sélectionné au départ. */
  defaultSelectedId?: string;
}

const NAV = [
  { value: "accueil", label: "Accueil", icon: <HomeIcon /> },
  { value: "drive", label: "Mon Drive", icon: <FolderIcon /> },
  { value: "recents", label: "Récents", icon: <ClockIcon /> },
  { value: "favoris", label: "Favoris", icon: <StarIcon /> },
  { value: "corbeille", label: "Corbeille", icon: <TrashIcon /> },
];

function FileCard({ file, selected, onSelect, onDetails }: { file: DriveFile; selected: boolean; onSelect: () => void; onDetails: () => void }) {
  return (
    <Card
      size="sm"
      interactive
      selected={selected}
      tabIndex={0}
      aria-label={file.name}
      onClick={onSelect}
      onDoubleClick={onDetails}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === " ") (e.preventDefault(), onSelect());
        if (e.key === "Enter") onDetails();
      }}
    >
      <CardHeader>
        <CardTitle style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, fontWeight: 500 }}>
          <span style={{ display: "flex", flexShrink: 0, width: 18, height: 18, color: file.tint }}><FileIcon /></span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
        </CardTitle>
        <CardAction>
          <Menu>
            <MenuTrigger asChild>
              <Button size="icon-sm" variant="ghost" aria-label={`Actions pour ${file.name}`} onClick={(e) => e.stopPropagation()}>
                <MoreIcon />
              </Button>
            </MenuTrigger>
            <MenuContent align="end">
              <MenuItem onSelect={onDetails}><FileIcon />Détails</MenuItem>
              <MenuItem><DownloadIcon />Télécharger</MenuItem>
              <MenuItem><EditIcon />Renommer</MenuItem>
              <MenuItem><CopyIcon />Créer une copie</MenuItem>
              <MenuSeparator />
              <MenuItem variant="danger"><TrashIcon />Placer dans la corbeille</MenuItem>
            </MenuContent>
          </Menu>
        </CardAction>
      </CardHeader>
      <CardMedia
        aspectRatio="16 / 9"
        style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${file.tint} 16%, var(--ui-panel)), var(--ui-panel))` }}
      />
      <CardDescription>{file.meta}</CardDescription>
    </Card>
  );
}

/**
 * Écran de gestion de fichiers : recherche qui filtre, puces de filtre, cartes sélectionnables,
 * menu « ⋯ », panneau Détails (double clic ou menu), réglages groupés et palette ⌘K.
 */
export function Drive({
  appName,
  userInitials,
  files: allFiles,
  fileTypes,
  storage,
  collaborators,
  newItemsLabel,
  defaultSelectedId,
}: DriveProps) {
  const [selected, setSelected] = React.useState(defaultSelectedId ?? allFiles[0]?.id ?? "");
  const [details, setDetails] = React.useState<DriveFile | null>(null);
  const [palette, setPalette] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [types, setTypes] = React.useState<string[]>([]);
  const [sync, setSync] = React.useState(true);
  const [offline, setOffline] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPalette((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const files = allFiles.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ display: "grid", gridTemplateRows: "auto 1fr", minHeight: "100vh", background: "var(--ui-app)", color: "var(--ui-fg)", fontFamily: "var(--ui-font-sans)" }}>
      {/* Barre supérieure : recherche en pilule (Drive) */}
      <header style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 20px 10px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: 232, flexShrink: 0 }}>
          <span style={{ display: "flex", width: 28, height: 28, color: "var(--ui-pri)" }}><CloudIcon /></span>
          <Text size={16} weight="medium" style={{ fontSize: 20 }}>{appName}</Text>
        </div>
        <div style={{ flex: 1, maxWidth: 720 }}>
          <SearchBar
            size="lg"
            aria-label="Rechercher dans le Drive"
            placeholder="Rechercher dans le Drive"
            value={query}
            onValueChange={setQuery}
            trailing={<Kbd style={{ marginRight: 10 }}>⌘K</Kbd>}
          />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
          <Tooltip content="Affichage grille">
            <Button size="icon" variant="ghost" aria-label="Affichage grille"><GridIcon /></Button>
          </Tooltip>
          <Avatar style={{ marginLeft: 8 }}><AvatarFallback>{userInitials}</AvatarFallback></Avatar>
        </div>
      </header>

      <Tabs defaultValue="drive" orientation="vertical" style={{ gap: 8, padding: "0 16px 16px 12px" }}>
        {/* Tiroir de navigation */}
        <aside style={{ display: "grid", alignContent: "start", gap: 16, width: 244 }}>
          <Button variant="elevated" size="lg" style={{ justifySelf: "start", marginLeft: 4 }} onClick={() => setPalette(true)}>
            <PlusIcon />Nouveau
          </Button>
          <TabsList aria-label="Navigation principale">
            {NAV.map((n) => (
              <TabsTrigger key={n.value} value={n.value}>{n.icon}{n.label}</TabsTrigger>
            ))}
          </TabsList>
          <div style={{ display: "grid", gap: 8, padding: "4px 16px" }}>
            <Progress value={storage.percent} size="sm" aria-label="Espace utilisé" />
            <Text size={12} tone="muted">{storage.label}</Text>
            <Button variant="outline" size="sm" style={{ justifySelf: "start" }}>Plus d'espace</Button>
          </div>
        </aside>

        {/* Surface principale. La mise en forme vit dans un conteneur : un
            `display` posé sur le panneau écraserait son attribut `hidden`. */}
        {NAV.map((n) => (
          <TabsContent key={n.value} value={n.value}>
            <div
              style={{
                display: "grid",
                alignContent: "start",
                gap: 24,
                minHeight: "100%",
                boxSizing: "border-box",
                padding: "20px 24px 28px",
                borderRadius: "var(--ui-r-2xl)",
                background: "var(--ui-panel)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <Heading size="md" style={{ fontWeight: 400, fontSize: 24 }}>{n.label}</Heading>
                {newItemsLabel && <Badge variant="pri">{newItemsLabel}</Badge>}
                <ToggleGroup type="single" defaultValue="tous" aria-label="Propriétaire" style={{ marginInlineStart: "auto" }}>
                  <ToggleGroupItem value="tous">Tous</ToggleGroupItem>
                  <ToggleGroupItem value="moi">Moi</ToggleGroupItem>
                  <ToggleGroupItem value="partages">Partagés</ToggleGroupItem>
                </ToggleGroup>
              </div>

              <ChipGroup aria-label="Type de fichier">
                {fileTypes.map((t) => (
                  <Chip
                    key={t}
                    selected={types.includes(t)}
                    onClick={() => setTypes((all) => (all.includes(t) ? all.filter((x) => x !== t) : [...all, t]))}
                  >
                    {t}
                  </Chip>
                ))}
              </ChipGroup>

              <section style={{ display: "grid", gap: 12 }}>
                <Text size={14} weight="medium">Suggestions</Text>
                {files.length === 0 ? (
                  <Text tone="subtle">Aucun fichier ne correspond à « {query} ».</Text>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
                    {files.map((f) => (
                      <FileCard
                        key={f.id}
                        file={f}
                        selected={selected === f.id}
                        onSelect={() => setSelected(f.id)}
                        onDetails={() => setDetails(f)}
                      />
                    ))}
                  </div>
                )}
              </section>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, alignItems: "start" }}>
                <ListSection title="Synchronisation" footer="Les fichiers hors connexion restent disponibles sans réseau.">
                  <List>
                    <ListItem
                      leading={<ListItemIcon tint="var(--ui-c1)"><CloudIcon /></ListItemIcon>}
                      trailing={<Switch checked={sync} onCheckedChange={setSync} aria-label="Sauvegarde automatique" />}
                    >
                      Sauvegarde automatique
                    </ListItem>
                    <ListItem
                      leading={<ListItemIcon tint="var(--ui-c3)"><DownloadIcon /></ListItemIcon>}
                      trailing={<Switch checked={offline} onCheckedChange={setOffline} aria-label="Disponible hors connexion" />}
                    >
                      Disponible hors connexion
                    </ListItem>
                    <ListItem leading={<ListItemIcon tint="var(--ui-c2)"><ClockIcon /></ListItemIcon>} trailing="30 jours" chevron asChild>
                      <button type="button">Conserver les versions</button>
                    </ListItem>
                  </List>
                </ListSection>
                <ListSection title="Partage">
                  <List>
                    <ListItem leading={<ListItemIcon tint="var(--ui-c5)"><StarIcon /></ListItemIcon>} trailing={<Badge variant="ok">Actif</Badge>}>
                      Accès des collaborateurs
                    </ListItem>
                    <ListItem
                      leading={<ListItemIcon tint="var(--ui-c4)"><FolderIcon /></ListItemIcon>}
                      trailing={<Button variant="tonal" size="sm">Gérer</Button>}
                    >
                      Dossiers partagés
                    </ListItem>
                  </List>
                </ListSection>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Panneau Détails : feuille flottante à droite */}
      <Sheet open={details != null} onOpenChange={(open) => !open && setDetails(null)}>
        <SheetContent side="right">
          {details && (
            <>
              <SheetHeader>
                <SheetTitle>{details.name}</SheetTitle>
                <SheetDescription>{details.size}</SheetDescription>
              </SheetHeader>
              <SheetBody style={{ display: "grid", gap: 20, alignContent: "start" }}>
                <Card>
                  <CardMedia
                    aspectRatio="4 / 3"
                    style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${details.tint} 18%, var(--ui-panel)), var(--ui-panel))` }}
                  />
                </Card>
                <ListSection title="Accès">
                  <List>
                    {collaborators.map((c) => (
                      <ListItem key={c.name} leading={<Avatar><AvatarFallback>{c.initials}</AvatarFallback></Avatar>} trailing={c.role}>{c.name}</ListItem>
                    ))}
                  </List>
                </ListSection>
                <ListSection title="Informations">
                  <List>
                    <ListItem trailing="Mon Drive">Emplacement</ListItem>
                    <ListItem trailing={details.meta.split(" · ")[1]}>Modifié</ListItem>
                  </List>
                </ListSection>
              </SheetBody>
              <SheetFooter>
                <Button variant="ghost">Copier le lien</Button>
                <Button>Partager</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Palette ⌘K, façon Spotlight */}
      <CommandDialog open={palette} onOpenChange={setPalette}>
        <CommandInput placeholder="Créer, ouvrir, rechercher…" />
        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          <CommandGroup heading="Créer">
            <CommandItem shortcut="⇧⌥F" onSelect={() => setPalette(false)}><FolderIcon />Nouveau dossier</CommandItem>
            <CommandItem shortcut="⌘U" onSelect={() => setPalette(false)}><DownloadIcon />Importer un fichier</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Fichiers">
            {allFiles.map((f) => (
              <CommandItem
                key={f.id}
                onSelect={() => {
                  setPalette(false);
                  setSelected(f.id);
                  setDetails(f);
                }}
              >
                <FileIcon />{f.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
