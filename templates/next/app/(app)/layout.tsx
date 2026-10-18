import { AppShell } from "@/components/app-shell";
import { isDemoInProduction, requireSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";

/**
 * Pages de l'application, dans la coque. La session est exigée ici ET dans chaque page ou action
 * protégée (`requireSession`) : un layout seul ne protège pas une page.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [session, locale] = await Promise.all([requireSession(), getLocale()]);
  return (
    <AppShell user={{ name: session.user.name, role: session.user.role }} locale={locale} demo={isDemoInProduction()}>
      {children}
    </AppShell>
  );
}
