import * as React from "react";
import { Toaster as Sonner, toast, type ToasterProps as SonnerProps } from "sonner";
import { useMessages } from "../../i18n/LocaleProvider";
import { Spinner } from "../spinner/Spinner";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const ICONS = {
  success: (
    <svg viewBox="0 0 16 16" {...stroke} aria-hidden="true"><path d="m5.25 8.25 1.9 1.9 3.6-4M14.25 8A6.25 6.25 0 1 1 1.75 8a6.25 6.25 0 0 1 12.5 0Z" /></svg>
  ),
  info: (
    <svg viewBox="0 0 16 16" {...stroke} aria-hidden="true"><path d="M8 7.25v4M8 4.75h.01M14.25 8A6.25 6.25 0 1 1 1.75 8a6.25 6.25 0 0 1 12.5 0Z" /></svg>
  ),
  warning: (
    <svg viewBox="0 0 16 16" {...stroke} aria-hidden="true"><path d="M8 6v3M8 11.25h.01M6.9 2.4 1.6 11.6A1.25 1.25 0 0 0 2.7 13.5h10.6a1.25 1.25 0 0 0 1.1-1.9L9.1 2.4a1.25 1.25 0 0 0-2.2 0Z" /></svg>
  ),
  error: (
    <svg viewBox="0 0 16 16" {...stroke} aria-hidden="true"><path d="M10 6 6 10M6 6l4 4M14.25 8A6.25 6.25 0 1 1 1.75 8a6.25 6.25 0 0 1 12.5 0Z" /></svg>
  ),
  loading: <Spinner size={16} label="" />,
};

export type ToasterProps = Omit<SonnerProps, "theme"> & {
  /** Suit le thème de l'application ; `system` suit l'OS. */
  theme?: SonnerProps["theme"];
};

/**
 * Notifications passagères, en matériau translucide comme celles d'iOS. Surface neutre dans tous les
 * cas : c'est l'icône qui porte le ton, un aplat coloré ferait crier une
 * information de passage. Monté une seule fois, près de la racine :
 *
 *   <Toaster />
 *   toast.success("Facture envoyée");
 *   toast.error("Envoi impossible", { description: message });
 *   toast.promise(enregistrer(), { loading: "…", success: "…", error: "…" });
 */
export interface ToastLabels {
  /** Bouton de fermeture d'une notification. « Fermer la notification » (sonner dit « Close toast »). */
  close: string;
  /** Nom de la région des notifications. « Notifications ». */
  region: string;
}
export const TOAST_LABELS: ToastLabels = { close: "Fermer la notification", region: "Notifications" };

export function Toaster({ theme, position = "bottom-right", toastOptions, ...props }: ToasterProps) {
  const labels = useMessages("toast", TOAST_LABELS);
  return (
    <Sonner
      theme={theme}
      position={position}
      icons={ICONS}
      gap={8}
      containerAriaLabel={labels.region}
      toastOptions={{
        unstyled: true,
        closeButtonAriaLabel: labels.close,
        ...toastOptions,
        classNames: {
          toast: "ui-toast",
          title: "ui-toast__title",
          description: "ui-toast__description",
          icon: "ui-toast__icon",
          content: "ui-toast__content",
          actionButton: "ui-button ui-button--default ui-button--size-sm ui-toast__button",
          cancelButton: "ui-button ui-button--outline ui-button--size-sm ui-toast__button",
          closeButton: "ui-toast__close",
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
}

export { toast };
