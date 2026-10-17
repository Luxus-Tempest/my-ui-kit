"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";
import {
  AppBar,
  AppBarActions,
  AppBarLeading,
  AppBarTitle,
  Avatar,
  AvatarFallback,
  Button,
  ListItemIcon,
  Menu,
  MenuContent,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  Tooltip,
} from "@rovia/ui";
import { Files, FileText, Languages, LayoutDashboard, Monitor, Moon, Sun, Users } from "lucide-react";
import { useLangue, type Langue } from "./providers";

const PAGES = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/utilisateurs", label: "Utilisateurs", icon: Users },
];

function ThemeMenu() {
  const { theme, setTheme } = useTheme();
  // Le thème n'est connu qu'après l'hydratation : avant, l'icône reste neutre.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const Icon = !mounted || theme === "system" ? Monitor : theme === "dark" ? Moon : Sun;
  return (
    <Menu>
      <Tooltip content="Thème">
        <MenuTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="Changer de thème">
            <Icon />
          </Button>
        </MenuTrigger>
      </Tooltip>
      <MenuContent align="end">
        <MenuLabel>Thème</MenuLabel>
        <MenuRadioGroup value={mounted ? theme : undefined} onValueChange={setTheme}>
          <MenuRadioItem value="light">Clair</MenuRadioItem>
          <MenuRadioItem value="dark">Sombre</MenuRadioItem>
          <MenuRadioItem value="system">Système</MenuRadioItem>
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}

function LanguageMenu() {
  const { langue, setLangue } = useLangue();
  return (
    <Menu>
      <Tooltip content="Langue">
        <MenuTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="Changer de langue">
            <Languages />
          </Button>
        </MenuTrigger>
      </Tooltip>
      <MenuContent align="end">
        <MenuLabel>Langue des composants</MenuLabel>
        <MenuRadioGroup value={langue} onValueChange={(value) => setLangue(value as Langue)}>
          <MenuRadioItem value="fr">Français</MenuRadioItem>
          <MenuRadioItem value="en">English</MenuRadioItem>
          <MenuRadioItem value="ar" lang="ar">العربية</MenuRadioItem>
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = PAGES.find((p) => (p.href === "/" ? pathname === "/" : pathname.startsWith(p.href)));
  return (
    <SidebarProvider style={{ height: "100svh" }}>
      <Sidebar collapsible="icon" label="Navigation principale">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Acme Documents" asChild>
                <NextLink href="/">
                  <ListItemIcon tint="var(--ui-pri)" style={{ width: 32, height: 32, borderRadius: "var(--ui-r-sm)" }}>
                    <Files />
                  </ListItemIcon>
                  <span>
                    <span>Acme Documents</span>
                    <span>Atlas Distribution</span>
                  </span>
                </NextLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {PAGES.map((page) => (
                  <SidebarMenuItem key={page.href}>
                    <SidebarMenuButton asChild isActive={page === current} tooltip={page.label}>
                      <NextLink href={page.href}>
                        <page.icon />
                        <span>{page.label}</span>
                      </NextLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Nadia Alami">
                <Avatar><AvatarFallback name="Nadia Alami" /></Avatar>
                <span>
                  <span>Nadia Alami</span>
                  <span>Administratrice</span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset style={{ overflowY: "auto" }}>
        <AppBar variant="plain">
          <AppBarLeading>
            <Tooltip content="Afficher / masquer" shortcut="⌘B">
              <SidebarTrigger />
            </Tooltip>
          </AppBarLeading>
          <AppBarTitle asChild>
            <span>{current?.label}</span>
          </AppBarTitle>
          <AppBarActions>
            <LanguageMenu />
            <ThemeMenu />
          </AppBarActions>
        </AppBar>
        <main className="grid content-start gap-6 px-6 pb-10 pt-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
