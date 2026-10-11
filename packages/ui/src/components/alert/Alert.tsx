import * as React from "react";
import { cn } from "../../utils/cn";

export type AlertTone = "neu" | "pri" | "ok" | "warn" | "err";

const ICONS: Record<AlertTone, React.ReactNode> = {
  neu: <path d="M8 7.25v4M8 4.75h.01M14.25 8A6.25 6.25 0 1 1 1.75 8a6.25 6.25 0 0 1 12.5 0Z" />,
  pri: <path d="M8 7.25v4M8 4.75h.01M14.25 8A6.25 6.25 0 1 1 1.75 8a6.25 6.25 0 0 1 12.5 0Z" />,
  ok: <path d="m5.25 8.25 1.9 1.9 3.6-4M14.25 8A6.25 6.25 0 1 1 1.75 8a6.25 6.25 0 0 1 12.5 0Z" />,
  warn: <path d="M8 6v3M8 11.25h.01M6.9 2.4 1.6 11.6A1.25 1.25 0 0 0 2.7 13.5h10.6a1.25 1.25 0 0 0 1.1-1.9L9.1 2.4a1.25 1.25 0 0 0-2.2 0Z" />,
  err: <path d="M8 4.75v3.75M8 11h.01M14.25 8A6.25 6.25 0 1 1 1.75 8a6.25 6.25 0 0 1 12.5 0Z" />,
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Ton sémantique : fond estompé et filet du ton, comme une pastille. */
  tone?: AlertTone;
  /** Icône à gauche : celle du ton par défaut, une autre, ou `false`. */
  icon?: React.ReactNode | false;
}

/**
 * Encadré d'information posé dans la page. Pour un
 * retour d'action passager, un toast. `warn` et `err` sont annoncés aux
 * lecteurs d'écran à leur apparition ; les autres tons sont du contenu.
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { className, tone = "neu", icon, role, children, ...props },
  ref,
) {
  const iconNode =
    icon === false ? null : icon ?? (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {ICONS[tone]}
      </svg>
    );
  // AlertAction se range à droite, hors du bloc de texte.
  const items = React.Children.toArray(children);
  const actions = items.filter((c) => React.isValidElement(c) && c.type === AlertAction);
  const body = items.filter((c) => !(React.isValidElement(c) && c.type === AlertAction));

  return (
    <div
      ref={ref}
      data-slot="alert"
      data-tone={tone}
      role={role ?? (tone === "err" || tone === "warn" ? "alert" : undefined)}
      className={cn("ui-alert", className)}
      {...props}
    >
      {iconNode && <span className="ui-alert__icon">{iconNode}</span>}
      <div className="ui-alert__body">{body}</div>
      {actions}
    </div>
  );
});

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p data-slot="alert-title" className={cn("ui-alert__title", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="alert-description" className={cn("ui-alert__description", className)} {...props} />;
}

/** Action à droite de l'encadré (un bouton `sm`). */
export function AlertAction({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="alert-action" className={cn("ui-alert__action", className)} {...props} />;
}
