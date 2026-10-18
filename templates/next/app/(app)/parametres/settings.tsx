"use client";

import { toast } from "@rovia/ui";
import { Parametres } from "@/components/blocks/parametres/Parametres";
import { parametresSample } from "@/components/blocks/parametres/parametres.sample";
import type { Session } from "@/lib/auth";

/**
 * Le bloc paramètres, avec l'utilisateur de la session. Branche `onSaveProfile` et
 * `onDeleteAccount` sur des actions serveur de ton application.
 */
export function Settings({ user }: { user: Session["user"] }) {
  const [firstName, ...rest] = user.name.split(" ");
  return (
    <Parametres
      {...parametresSample}
      user={{
        ...parametresSample.user,
        firstName: firstName ?? "",
        lastName: rest.join(" "),
        email: user.email,
        bio: "",
      }}
      onSaveProfile={() => toast.success("Profil enregistré")}
      onDeleteAccount={() => toast("Suppression du compte : à brancher sur ton fournisseur.")}
    />
  );
}
