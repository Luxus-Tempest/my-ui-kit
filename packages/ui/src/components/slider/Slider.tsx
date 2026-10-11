import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../../utils/cn";
import { useFieldControl } from "../field/Field";

export interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  /**
   * Nom accessible de chaque pastille, dans l'ordre. Par défaut : « Valeur »
   * pour une pastille, « Minimum » / « Maximum » pour deux,
   * « Valeur 1 sur 3 »… au-delà. Dans un Field (ou avec `aria-labelledby` /
   * `aria-label`), il complète le libellé du champ : « Prix Minimum ».
   */
  thumbLabels?: string[];
  /** Graduations affichées sous la piste, avec leur valeur formatée en fr-FR. */
  marks?: number[];
  /** Erreur : passe la plage et le halo en rouge. Repris du Field s'il est invalide. */
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
}

const markFormat = new Intl.NumberFormat("fr-FR");

function defaultThumbLabel(index: number, count: number) {
  if (count === 1) return "Valeur";
  if (count === 2) return index === 0 ? "Minimum" : "Maximum";
  return `Valeur ${index + 1} sur ${count}`;
}

/**
 * Curseur aux proportions d'iOS : piste de 4 px en pilule, plage primaire,
 * pastille de 24 px surélevée qui grossit à l'appui. Une valeur (`[50]`) ou une
 * plage (`[20, 80]`, une pastille par valeur). Flèches (pas), Pg. préc. / Pg. suiv.
 * (pas × 10), Origine / Fin (bornes).
 *
 * Dans un `Field`, chaque pastille reçoit le libellé du champ (`aria-labelledby`),
 * son aide et son erreur (`aria-describedby`, `aria-invalid`) et l'état désactivé.
 */
export const Slider = React.forwardRef<HTMLSpanElement, SliderProps>(function Slider(
  { className, thumbLabels, marks, value, defaultValue, min = 0, max = 100, ...rest },
  ref,
) {
  const {
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": labelledBy,
    "aria-describedby": describedBy,
    "aria-invalid": ariaInvalid,
    // `required` n'a pas de sens pour un curseur (il a toujours une valeur) : on ne le transmet pas.
    required: _required,
    disabled,
    ...props
  } = useFieldControl(rest, { labelledBy: true }) as typeof rest & { required?: boolean };

  const autoId = React.useId();
  const baseId = id ?? `slider-${autoId}`;
  const count = (value ?? defaultValue ?? [min]).length;
  const invalid = ariaInvalid === true || ariaInvalid === "true";
  const [dragging, setDragging] = React.useState(false);
  const stopDragging = () => setDragging(false);

  return (
    <SliderPrimitive.Root
      ref={ref}
      id={baseId}
      data-slot="slider"
      data-invalid={invalid || undefined}
      data-dragging={dragging || undefined}
      data-marks={marks?.length ? "" : undefined}
      className={cn("ui-slider", className)}
      value={value}
      defaultValue={defaultValue ?? (value ? undefined : [min])}
      min={min}
      max={max}
      disabled={disabled}
      {...props}
      onPointerDown={(event) => {
        props.onPointerDown?.(event);
        if (!disabled) setDragging(true);
      }}
      onPointerUp={(event) => {
        props.onPointerUp?.(event);
        stopDragging();
      }}
      onPointerCancel={(event) => {
        props.onPointerCancel?.(event);
        stopDragging();
      }}
      onLostPointerCapture={(event) => {
        props.onLostPointerCapture?.(event);
        stopDragging();
      }}
    >
      <SliderPrimitive.Track className="ui-slider__track" data-slot="slider-track">
        <SliderPrimitive.Range className="ui-slider__range" data-slot="slider-range" />
      </SliderPrimitive.Track>
      {Array.from({ length: count }, (_, index) => {
        const thumbId = `${baseId}-thumb-${index}`;
        const thumbLabel = thumbLabels?.[index] ?? defaultThumbLabel(index, count);
        // Une seule pastille sans libellé propre : le nom du champ suffit.
        const fieldNameOnly = count === 1 && !thumbLabels?.[index];
        let naming: { "aria-label"?: string; "aria-labelledby"?: string };
        if (labelledBy) {
          // Auto-référence : le nom devient « libellé du champ + libellé de la pastille ».
          naming = fieldNameOnly
            ? { "aria-labelledby": labelledBy }
            : { "aria-labelledby": `${labelledBy} ${thumbId}`, "aria-label": thumbLabel };
        } else if (ariaLabel) {
          naming = { "aria-label": fieldNameOnly ? ariaLabel : `${ariaLabel} ${thumbLabel}` };
        } else {
          naming = { "aria-label": thumbLabel };
        }
        return (
          <SliderPrimitive.Thumb
            key={index}
            id={thumbId}
            data-slot="slider-thumb"
            className="ui-slider__thumb"
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            {...naming}
          />
        );
      })}
      {marks?.length ? (
        <span className="ui-slider__marks" aria-hidden="true">
          {marks.map((mark) => {
            const percent = ((Math.min(Math.max(mark, min), max) - min) / (max - min)) * 100;
            return (
              <span
                key={mark}
                className="ui-slider__mark"
                style={{ "--_p": percent } as React.CSSProperties}
              >
                {markFormat.format(mark)}
              </span>
            );
          })}
        </span>
      ) : null}
    </SliderPrimitive.Root>
  );
});
