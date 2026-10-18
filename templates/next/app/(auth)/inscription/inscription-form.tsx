"use client";

import * as React from "react";
import { Inscription } from "@/components/blocks/inscription/Inscription";
import { siteConfig } from "@/config/site";
import { signUpAction } from "@/lib/actions";

/** Le bloc inscription, branché sur l'action serveur `signUpAction` (lib/auth.ts). */
export function InscriptionForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  return (
    <Inscription
      appName={siteConfig.name}
      description="Quelques secondes suffisent."
      signInHref="/connexion"
      error={error}
      pending={pending}
      onSubmit={(values) =>
        startTransition(async () => {
          setError(null);
          const result = await signUpAction(values);
          if (result?.error) setError(result.error);
        })
      }
    />
  );
}
