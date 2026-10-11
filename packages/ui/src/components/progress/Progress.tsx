import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../../utils/cn";

export type ProgressTone = "pri" | "ok" | "warn" | "err";

export interface ProgressProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, "children"> {
  /** `null` ou absent : progression indéterminée (barre qui balaie). */
  value?: number | null;
  tone?: ProgressTone;
  /** `default` : 6 px. `sm` : 4 px. */
  size?: "sm" | "default";
  /** Libellé affiché au-dessus et relié à la barre pour les lecteurs d'écran. */
  label?: React.ReactNode;
  /** Affiche la valeur à droite du libellé : `true` → « 42 % », ou un formateur. */
  showValue?: boolean | ((value: number, max: number) => React.ReactNode);
}

/** Barre de progression. Sans `label`, passe un `aria-label`. */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { className, value = null, max = 100, tone = "pri", size = "default", label, showValue, ...props },
  ref,
) {
  const labelId = React.useId();
  const clamped = value == null ? null : Math.min(Math.max(value, 0), max);
  const percent = clamped == null ? null : (clamped / max) * 100;

  const bar = (
    <ProgressPrimitive.Root
      ref={ref}
      data-slot="progress"
      data-tone={tone}
      data-size={size}
      value={clamped}
      max={max}
      aria-labelledby={label ? labelId : undefined}
      className={cn("ui-progress", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="ui-progress__indicator"
        data-slot="progress-indicator"
        style={percent == null ? undefined : { transform: `translateX(-${100 - percent}%)` }}
      />
    </ProgressPrimitive.Root>
  );

  if (!label && !showValue) return bar;

  const valueText =
    clamped == null
      ? null
      : typeof showValue === "function"
        ? showValue(clamped, max)
        : showValue
          ? `${Math.round(percent!)} %`
          : null;

  return (
    <div className="ui-progress-field" data-slot="progress-field">
      <div className="ui-progress-field__header">
        {label && (
          <span id={labelId} className="ui-progress-field__label">
            {label}
          </span>
        )}
        {valueText != null && (
          <span className="ui-progress-field__value" aria-hidden="true">
            {valueText}
          </span>
        )}
      </div>
      {bar}
    </div>
  );
});
