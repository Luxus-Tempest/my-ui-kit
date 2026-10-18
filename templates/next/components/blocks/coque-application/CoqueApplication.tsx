"use client";
/* @rovia/ui 1.1.0 · coque-application */
import * as React from "react";
import { AppBar, AppBarActions, AppBarLeading, AppBarTitle } from "@rovia/ui/app-bar";
import { Avatar, AvatarFallback } from "@rovia/ui/avatar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@rovia/ui/breadcrumb";
import { ListItemIcon } from "@rovia/ui/list";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "@rovia/ui/menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger } from "@rovia/ui/sidebar";
import { Tooltip } from "@rovia/ui/tooltip";
import { ChevronsUpDown, LayoutGrid, LogOut, type LucideIcon } from "lucide-react";

/** Une entrée de navigation. */
export interface CoqueNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Pastille de compteur (non lus, en retard…). */
  badge?: number;
}

/** Un groupe d'entrées, avec un titre facultatif (« Aide »). */
export interface CoqueNavGroup {
  label?: string;
  items: CoqueNavItem[];
}

/** Composant de lien : le `Link` de ton framework (Next.js…), ou `<a>` par défaut. */
export type CoqueLinkComponent = React.ElementType<{ href: string; children?: React.ReactNode; className?: string }>;

export interface CoqueApplicationProps {
  /** Nom de l'application, en tête de la barre latérale. */
  appName: string;
  /** Sous titre sous le nom (société, espace de travail). */
  orgName?: string;
  /** Logo ; par défaut une tuile teintée de la couleur primaire. */
  logo?: React.ReactNode;
  navigation: CoqueNavGroup[];
  /** Adresse de la page affichée : marque l'entrée active et construit le fil d'Ariane. */
  activeHref: string;
  user: { name: string; role: string };
  onSignOut: () => void;
  /** Boutons de la barre d'application (thème, langue, aide…). */
  actions?: React.ReactNode;
  /** Bandeau au dessus de la page (mode démonstration, annonce). */
  banner?: React.ReactNode;
  linkComponent?: CoqueLinkComponent;
  children: React.ReactNode;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/** Entrée active : l'adresse exacte, ou la plus longue entrée dont l'adresse est un préfixe. */
function findActive(navigation: CoqueNavGroup[], href: string) {
  let found: { group: CoqueNavGroup; item: CoqueNavItem } | undefined;
  for (const group of navigation) {
    for (const item of group.items) {
      const match = href === item.href || href.startsWith(item.href.endsWith("/") ? item.href : `${item.href}/`);
      if (match && (!found || item.href.length > found.item.href.length)) found = { group, item };
    }
  }
  return found;
}

/**
 * Coque d'application : barre latérale réductible (⌘B), barre d'application avec fil d'Ariane,
 * actions et menu utilisateur, zone de page (`#contenu`, cible du lien « Aller au contenu »).
 * Point de départ de toute application de gestion.
 */
export function CoqueApplication({
  appName,
  orgName,
  logo,
  navigation,
  activeHref,
  user,
  onSignOut,
  actions,
  banner,
  linkComponent: LinkComponent = "a",
  children,
}: CoqueApplicationProps) {
  const active = findActive(navigation, activeHref);
  return (
    <SidebarProvider style={{ height: "100svh" }}>
      <Sidebar collapsible="icon" label="Navigation principale">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip={appName}>
                {logo ?? (
                  <ListItemIcon tint="var(--ui-pri)" style={{ width: 32, height: 32, borderRadius: "var(--ui-r-sm)" }}>
                    <LayoutGrid />
                  </ListItemIcon>
                )}
                <span>
                  <span>{appName}</span>
                  {orgName && <span>{orgName}</span>}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {navigation.map((group, index) => (
            <SidebarGroup key={group.label ?? index}>
              {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild tooltip={item.label} isActive={active?.item.href === item.href}>
                        <LinkComponent href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </LinkComponent>
                      </SidebarMenuButton>
                      {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Menu>
                <MenuTrigger asChild>
                  <SidebarMenuButton size="lg" tooltip={user.name}>
                    <Avatar><AvatarFallback>{initials(user.name)}</AvatarFallback></Avatar>
                    <span>
                      <span>{user.name}</span>
                      <span>{user.role}</span>
                    </span>
                    <ChevronsUpDown />
                  </SidebarMenuButton>
                </MenuTrigger>
                <MenuContent side="top" align="start" style={{ minWidth: 232 }}>
                  <MenuLabel>{user.name}</MenuLabel>
                  <MenuSeparator />
                  <MenuItem onSelect={onSignOut}><LogOut />Se déconnecter</MenuItem>
                </MenuContent>
              </Menu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset style={{ overflowY: "auto" }}>
        {banner}
        <AppBar variant="plain">
          <AppBarLeading>
            <Tooltip content="Afficher / masquer" shortcut="⌘B">
              <SidebarTrigger />
            </Tooltip>
          </AppBarLeading>
          <AppBarTitle asChild>
            <div>
              <Breadcrumb>
                <BreadcrumbList>
                  {active?.group.label && (
                    <>
                      <BreadcrumbItem>{active.group.label}</BreadcrumbItem>
                      <BreadcrumbSeparator />
                    </>
                  )}
                  <BreadcrumbItem><BreadcrumbPage>{active?.item.label ?? appName}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </AppBarTitle>
          {actions && <AppBarActions>{actions}</AppBarActions>}
        </AppBar>
        <div id="contenu" tabIndex={-1} style={{ outline: "none", padding: "4px 24px 32px" }}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
