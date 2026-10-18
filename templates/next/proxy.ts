import { NextResponse, type NextRequest } from "next/server";

/**
 * Transmet le chemin demandé aux pages, dans l'en tête `x-pathname` : `requireSession`
 * (lib/auth.ts) s'en sert pour revenir à la bonne page après connexion. Aucune logique
 * d'authentification ici ; si ton fournisseur demande son propre proxy, combine les deux.
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Pas sur les fichiers statiques, les images optimisées ni les fichiers de métadonnées.
  matcher: ["/((?!_next/static|_next/image|icons/|favicon.ico|icon.svg|.*\\.(?:png|jpg|svg|webmanifest|txt|xml)$).*)"],
};
