import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "../../utils/cn";

export type AvatarSize = "sm" | "default" | "lg";

/** Taille héritée d'un AvatarGroup : on la déclare une fois pour tout le groupe. */
const AvatarSizeContext = React.createContext<AvatarSize | undefined>(undefined);

export interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  /** 24 / 32 / 40 px. */
  size?: AvatarSize;
}

/** Avatar rond. L'image se remplace par AvatarFallback tant qu'elle ne s'est pas chargée. */
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { className, size, ...props },
  ref,
) {
  const groupSize = React.useContext(AvatarSizeContext);
  return (
    <AvatarPrimitive.Root
      ref={ref}
      data-slot="avatar"
      data-size={size ?? groupSize ?? "default"}
      className={cn("ui-avatar", className)}
      {...props}
    />
  );
});

export const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(function AvatarImage({ className, ...props }, ref) {
  return <AvatarPrimitive.Image ref={ref} data-slot="avatar-image" className={cn("ui-avatar__image", className)} {...props} />;
});

export interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  /** Nom complet : les initiales en sont tirées si aucun enfant n'est fourni. */
  name?: string;
}

export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(function AvatarFallback(
  { className, name, children, ...props },
  ref,
) {
  return (
    <AvatarPrimitive.Fallback ref={ref} data-slot="avatar-fallback" className={cn("ui-avatar__fallback", className)} {...props}>
      {children ?? (name ? getInitials(name) : null)}
    </AvatarPrimitive.Fallback>
  );
});

export type AvatarBadgeTone = "pri" | "ok" | "warn" | "err" | "neu";

export interface AvatarBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: AvatarBadgeTone;
  /** Texte annoncé (« En ligne », « Absent »…). Sans lui, la pastille est décorative. */
  label?: string;
}

/** Pastille d'état posée en bas à droite de l'avatar. */
export const AvatarBadge = React.forwardRef<HTMLSpanElement, AvatarBadgeProps>(function AvatarBadge(
  { className, tone = "ok", label, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      data-slot="avatar-badge"
      data-tone={tone}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("ui-avatar__badge", className)}
      {...props}
    />
  );
});

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: AvatarSize;
}

/** Avatars qui se chevauchent, chacun cerclé de la couleur du fond. */
export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { className, size = "default", ...props },
  ref,
) {
  return (
    <AvatarSizeContext.Provider value={size}>
      <div ref={ref} data-slot="avatar-group" data-size={size} className={cn("ui-avatar-group", className)} {...props} />
    </AvatarSizeContext.Provider>
  );
});

/** Le « +3 » qui clôt un groupe. */
export const AvatarGroupCount = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function AvatarGroupCount({ className, ...props }, ref) {
    const size = React.useContext(AvatarSizeContext) ?? "default";
    return (
      <span
        ref={ref}
        data-slot="avatar-group-count"
        data-size={size}
        className={cn("ui-avatar", "ui-avatar__fallback", "ui-avatar-group__count", className)}
        {...props}
      />
    );
  },
);

/** « Fatima Zahra El Idrissi » → « FI » (premier et dernier mot). */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0]!.charAt(0);
  const last = words.length > 1 ? words[words.length - 1]!.charAt(0) : "";
  return (first + last).toLocaleUpperCase();
}
