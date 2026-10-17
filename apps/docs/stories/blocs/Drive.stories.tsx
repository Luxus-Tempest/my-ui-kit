import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardMedia,
  CardTitle,
  Chip,
  ChipGroup,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Heading,
  Kbd,
  List,
  ListItem,
  ListItemIcon,
  ListSection,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Progress,
  SearchBar,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ToggleGroup,
  ToggleGroupItem,
  Text,
  Tooltip,
} from "@rovia/ui";
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
} from "../_shared/icons";

const meta: Meta = {
  title: "Blocs/Drive",
  parameters: {
    padding: 0,
    docs: {
      description: {
        component:
          "Un écran complet de gestion de fichiers, assemblé uniquement avec les composants de la librairie. **De Drive** : surfaces tonales plutôt qu'ombres, sélection en conteneur bleu, actions et filtres en pilule, couches d'état au survol, infobulles inversées. **D'iOS** : grands rayons continus, matériau translucide pour ce qui flotte, listes groupées, interrupteurs et segmented control, feuilles et courbes en ressort.",
      },
    },
  },
};
export default meta;

type File = { id: string; name: string; meta: string; tint: string; size: string };

const FILES: File[] = [
  { id: "budget", name: "Budget 2027.xlsx", meta: "Modifié par vous · 9 oct.", tint: "var(--ui-c3)", size: "284 Ko" },
  { id: "contrat", name: "Contrat cadre.pdf", meta: "Partagé par Inès · hier", tint: "var(--ui-c2)", size: "1,2 Mo" },
  { id: "q4", name: "Présentation Q4", meta: "Ouvert par vous · 2 oct.", tint: "var(--ui-c4)", size: "8,4 Mo" },
  { id: "notes", name: "Notes de réunion", meta: "Modifié par Karim · 28 sept.", tint: "var(--ui-c1)", size: "36 Ko" },
];

const NAV = [
  { value: "accueil", label: "Accueil", icon: <HomeIcon /> },
  { value: "drive", label: "Mon Drive", icon: <FolderIcon /> },
  { value: "recents", label: "Récents", icon: <ClockIcon /> },
  { value: "favoris", label: "Favoris", icon: <StarIcon /> },
  { value: "corbeille", label: "Corbeille", icon: <TrashIcon /> },
];

const TYPES = ["Documents", "Feuilles de calcul", "PDF", "Présentations"];

function FileCard({ file, selected, onSelect, onDetails }: { file: File; selected: boolean; onSelect: () => void; onDetails: () => void }) {
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

function Showcase() {
  const [selected, setSelected] = React.useState("contrat");
  const [details, setDetails] = React.useState<File | null>(null);
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

  const files = FILES.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ display: "grid", gridTemplateRows: "auto 1fr", minHeight: "100vh", background: "var(--ui-app)", fontFamily: "var(--ui-font-sans)" }}>
      {/* Barre supérieure : recherche en pilule (Drive) */}
      <header style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 20px 10px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: 232, flexShrink: 0 }}>
          <span style={{ display: "flex", width: 28, height: 28, color: "var(--ui-pri)" }}><CloudIcon /></span>
          <Text size={16} weight="medium" style={{ fontSize: 20 }}>Nuage</Text>
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
          <Avatar style={{ marginLeft: 8 }}><AvatarFallback>SB</AvatarFallback></Avatar>
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
            <Progress value={21} size="sm" aria-label="Espace utilisé" />
            <Text size={12} tone="muted">3,2 Go utilisés sur 15 Go</Text>
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
                <Badge variant="pri">4 nouveautés</Badge>
                <ToggleGroup type="single" defaultValue="tous" aria-label="Propriétaire" style={{ marginInlineStart: "auto" }}>
                  <ToggleGroupItem value="tous">Tous</ToggleGroupItem>
                  <ToggleGroupItem value="moi">Moi</ToggleGroupItem>
                  <ToggleGroupItem value="partages">Partagés</ToggleGroupItem>
                </ToggleGroup>
              </div>

              <ChipGroup aria-label="Type de fichier">
                {TYPES.map((t) => (
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
                    <ListItem leading={<Avatar><AvatarFallback>SB</AvatarFallback></Avatar>} trailing="Propriétaire">Vous</ListItem>
                    <ListItem leading={<Avatar><AvatarFallback>IB</AvatarFallback></Avatar>} trailing="Éditeur">Inès Benali</ListItem>
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
            {FILES.map((f) => (
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

/**
 * Recherche qui filtre, puces de filtre, cartes sélectionnables, menu « ⋯ », panneau
 * Détails (double-clic ou menu), réglages groupés et palette ⌘K (ou bouton « Nouveau »).
 */
export const Ecran: StoryObj = { name: "Écran complet", render: () => <Showcase /> };
