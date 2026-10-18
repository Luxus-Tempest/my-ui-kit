import type { FormulaireClientProps } from "./FormulaireClient";

/**
 * Données d'exemple : le bloc s'affiche dès l'installation, avec une erreur de
 * validation pour montrer son rendu. Branche `onSubmit` sur ton enregistrement.
 */
export const formulaireClientSample = {
  defaultValues: { ice: "00215487", devise: "mad", conditions: "30", tva: true, relances: true },
  errors: { ice: "L'ICE compte 15 chiffres." },
  currencies: [
    { value: "mad", label: "Dirham (MAD)" },
    { value: "eur", label: "Euro (EUR)" },
    { value: "usd", label: "Dollar (USD)" },
  ],
  paymentTerms: [
    { value: "0", label: "Comptant" },
    { value: "30", label: "30 jours" },
    { value: "60", label: "60 jours" },
  ],
} satisfies Omit<FormulaireClientProps, "onSubmit">;
