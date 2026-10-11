import "@testing-library/jest-dom/vitest";
import * as matchers from "vitest-axe/matchers";
import { configureAxe } from "vitest-axe";
import { expect } from "vitest";

expect.extend(matchers);

// jsdom n'a pas de canvas : le contraste des couleurs est vérifié dans Storybook (addon a11y).
export const axe = configureAxe({
  rules: { "color-contrast": { enabled: false } },
  globalOptions: {
    rules: [
      {
        // La règle reste active partout, sauf sur trois mécanismes voulus de Radix :
        // gardes de focus, contenu masqué derrière une modale (focus piégé, donc
        // inatteignable) et proxy de focus de NavigationMenu (renvoie le focus au panneau).
        id: "aria-hidden-focus",
        selector:
          '[aria-hidden="true"]:not([data-radix-focus-guard]):not([data-aria-hidden="true"]):not(.ui-navigation-menu__item > [aria-hidden="true"])',
      },
    ],
  },
});

// API du navigateur absentes de jsdom, dont les surcouches Radix ont besoin.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
const proto = window.HTMLElement.prototype as unknown as Record<string, unknown>;
proto.scrollIntoView ??= function () {};
proto.hasPointerCapture ??= function () { return false; };
proto.releasePointerCapture ??= function () {};
proto.setPointerCapture ??= function () {};
// input-otp lit la case sous le pointeur.
document.elementFromPoint ??= () => null;
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;
