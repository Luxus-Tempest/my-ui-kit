import { Skeleton } from "@rovia/ui";

/** Chargement d'une page de l'application, dans la coque : titre, indicateurs et contenu. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Chargement" className="grid gap-6">
      <Skeleton style={{ width: 240, height: 32 }} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <Skeleton style={{ height: 112 }} />
        <Skeleton style={{ height: 112 }} />
        <Skeleton style={{ height: 112 }} />
        <Skeleton style={{ height: 112 }} />
      </div>
      <Skeleton style={{ height: 320 }} />
    </div>
  );
}
