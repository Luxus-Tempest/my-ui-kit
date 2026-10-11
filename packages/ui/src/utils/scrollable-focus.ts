const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/**
 * Une zone qui défile sans rien de focalisable à l'intérieur devient
 * focalisable (`tabindex="0"`) : sans cela, le clavier ne peut pas la faire
 * défiler (WCAG 2.1.1). Le `tabindex` posé ici est retiré dès qu'il n'est plus
 * utile ; un `tabindex` fourni par l'appelant n'est jamais touché.
 */
export function syncScrollableFocus(el: HTMLElement) {
  const style = getComputedStyle(el);
  const scrolls = (overflow: string) => overflow === "auto" || overflow === "scroll";
  const scrollable =
    (scrolls(style.overflowY) && el.scrollHeight > el.clientHeight + 1) ||
    (scrolls(style.overflowX) && el.scrollWidth > el.clientWidth + 1);
  const needed = scrollable && el.querySelector(FOCUSABLE) == null;
  const owned = el.hasAttribute("data-scroll-focus");
  if (needed && !el.hasAttribute("tabindex")) {
    el.tabIndex = 0;
    el.setAttribute("data-scroll-focus", "");
  } else if (!needed && owned) {
    el.removeAttribute("tabindex");
    el.removeAttribute("data-scroll-focus");
  }
}

/** Observe la zone (taille, contenu) et tient son `tabindex` à jour. Renvoie le nettoyage. */
export function watchScrollableFocus(el: HTMLElement) {
  const update = () => syncScrollableFocus(el);
  update();
  const observer = new ResizeObserver(update);
  observer.observe(el);
  if (el.firstElementChild) observer.observe(el.firstElementChild);
  return () => observer.disconnect();
}
