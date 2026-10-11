import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

// Déclaration locale au module : pas besoin de @types/node. Les bundlers
// (Vite, webpack, Next) remplacent process.env.NODE_ENV à la compilation.
declare const process: { env: { NODE_ENV?: string } };

/**
 * Bouton. La variante est le **rôle**, jamais la couleur : une seule action
 * `default` (primaire) par vue, le reste est `outline`, `ghost` ou icône.
 *
 * Géométrie : pilule de 32 / 36 / 44 px, corps 13 / 14 / 15 px en graisse 500 ;
 * les boutons icône sont des cercles. Tous les états (repos, survol, pressé, enfoncé,
 * ouvert, focus, invalide, désactivé, chargement) sont décrits dans button.css :
 * un état absent de cette table n'existe pas dans le produit.
 */
export const buttonVariants = cva("ui-button", {
  variants: {
    variant: {
      /** Action primaire, une seule par vue. */
      default: "ui-button--default",
      /**
       * Action mise en avant sans être pleine : conteneur primaire
       * (bouton « tinted » d'iOS, « filled tonal » de Drive).
       */
      tonal: "ui-button--tonal",
      /**
       * Action de création posée sur le fond d'application (le « + Nouveau »
       * de Drive). En `size="lg"`, prend le rayon d'une carte et 56 px.
       */
      elevated: "ui-button--elevated",
      /** Action secondaire, la plus courante. */
      outline: "ui-button--outline",
      /** Secondaire sur fond de carte légèrement teinté. */
      secondary: "ui-button--secondary",
      /** Ni fond, ni filet, ni ombre au repos. */
      ghost: "ui-button--ghost",
      /** Retire un accès ou détruit, sans crier. */
      danger: "ui-button--danger",
      /** Primaire destructive : la seule action pleine rouge, en pied de confirmation. */
      destructive: "ui-button--destructive",
      link: "ui-button--link",
      /** Appel principal sur le bandeau de marque sombre (`--ui-brand-wash`). */
      onDark: "ui-button--on-dark",
      /** Second rang sur le bandeau de marque sombre. */
      onDarkGhost: "ui-button--on-dark-ghost",
    },
    size: {
      sm: "ui-button--size-sm",
      default: "ui-button--size-default",
      /** Appels à l'action de la surface publique. */
      lg: "ui-button--size-lg",
      icon: "ui-button--size-icon",
      "icon-sm": "ui-button--size-icon-sm",
      "icon-lg": "ui-button--size-icon-lg",
    },
    fullWidth: { true: "ui-button--full" },
  },
  defaultVariants: { variant: "default", size: "default" },
});

type ButtonVariantProps = VariantProps<typeof buttonVariants>;
export type ButtonVariant = NonNullable<ButtonVariantProps["variant"]>;
export type ButtonSize = NonNullable<ButtonVariantProps["size"]>;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  /**
   * Rend l'enfant unique à la place du `<button>` (un `<a>`, un `<Link>`…),
   * en lui transmettant classes, ref et gestionnaires.
   */
  asChild?: boolean;
  /**
   * Action en cours : le bouton garde sa largeur et son focus, affiche un
   * indicateur et ignore les clics. Non disponible avec `asChild`.
   */
  loading?: boolean;
}

const ICON_SIZES = new Set<ButtonSize>(["icon", "icon-sm", "icon-lg"]);

/**
 * Valeurs par défaut transmises par un parent (ButtonGroup) : la variante et
 * la taille d'un bouton l'emportent toujours sur celles du groupe.
 */
export const ButtonDefaultsContext = React.createContext<{ variant?: ButtonVariant; size?: ButtonSize }>({});

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant: variantProp,
    size: sizeProp,
    fullWidth,
    asChild = false,
    loading = false,
    disabled,
    type,
    onClick,
    children,
    ...props
  },
  ref,
) {
  const defaults = React.useContext(ButtonDefaultsContext);
  const variant = variantProp ?? defaults.variant;
  const size = sizeProp ?? defaults.size;
  const Comp = asChild ? Slot : "button";
  const isLoading = loading && !asChild;
  // Un lien (asChild) ne peut pas être `disabled` : on bloque le clic et on l'annonce.
  const isBlocked = Boolean(disabled) || isLoading;

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useIconLabelWarning(size, props);
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isBlocked) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      type={asChild ? undefined : (type ?? "button")}
      // `disabled` natif seulement quand c'est voulu : en chargement, le bouton
      // reste focusable pour que le lecteur d'écran ne perde pas sa place.
      disabled={asChild ? undefined : disabled}
      aria-disabled={isBlocked || undefined}
      aria-busy={isLoading || undefined}
      data-loading={isLoading || undefined}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="ui-button__content">{children}</span>
          <span className="ui-button__spinner" aria-hidden="true" />
        </>
      ) : (
        children
      )}
    </Comp>
  );
});

/** En développement, signale un bouton icône sans nom accessible. */
function useIconLabelWarning(size: ButtonVariantProps["size"], props: React.AriaAttributes & { title?: string }) {
  const unlabeled =
    size != null && ICON_SIZES.has(size) && !props["aria-label"] && !props["aria-labelledby"] && !props.title;
  React.useEffect(() => {
    if (unlabeled) {
      console.warn(
        `[Button] Un bouton size="${size}" n'affiche qu'une icône : ajoute aria-label pour les lecteurs d'écran.`,
      );
    }
  }, [unlabeled, size]);
}
