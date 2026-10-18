import { Skeleton } from "@rovia/ui";

/** Chargement d'un écran d'authentification : la carte centrée. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Chargement" className="grid min-h-svh place-items-center px-4">
      <Skeleton style={{ width: "100%", maxWidth: 400, height: 460, borderRadius: "var(--ui-r-xl)" }} />
    </div>
  );
}
