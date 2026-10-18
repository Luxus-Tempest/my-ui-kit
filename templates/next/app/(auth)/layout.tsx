/** Écrans d'authentification : pleine page, sans coque. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="contenu" tabIndex={-1} className="outline-none">
      {children}
    </main>
  );
}
