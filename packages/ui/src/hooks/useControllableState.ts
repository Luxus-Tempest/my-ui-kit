import * as React from "react";

export interface UseControllableStateParams<T> {
  /** Valeur contrôlée ; `undefined` = non contrôlé. */
  value?: T;
  /** Valeur initiale en mode non contrôlé. */
  defaultValue: T;
  /** Appelé à chaque changement, contrôlé ou non. */
  onChange?: (value: T) => void;
}

/**
 * État « contrôlé ou non » des composants : `value` + `onChange` si le parent
 * pilote, `defaultValue` sinon. Le même modèle que les props des composants
 * de la librairie, réutilisable pour composer les siens.
 *
 *   const [open, setOpen] = useControllableState({ value: props.open, defaultValue: false, onChange: props.onOpenChange });
 */
export function useControllableState<T>({ value, defaultValue, onChange }: UseControllableStateParams<T>) {
  const [inner, setInner] = React.useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : inner;
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  const currentRef = React.useRef(current);
  currentRef.current = current;

  const setValue = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(currentRef.current) : next;
      if (Object.is(resolved, currentRef.current)) return;
      if (!controlled) setInner(resolved);
      onChangeRef.current?.(resolved);
    },
    [controlled],
  );

  return [current, setValue] as const;
}
