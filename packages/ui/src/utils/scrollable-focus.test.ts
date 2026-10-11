import { syncScrollableFocus } from "./scrollable-focus";

function zone(html: string, overflow = "auto") {
  const el = document.createElement("div");
  // jsdom ne développe pas le raccourci `overflow` : les deux axes explicitement.
  el.style.overflowX = overflow;
  el.style.overflowY = overflow;
  el.innerHTML = html;
  document.body.append(el);
  Object.defineProperty(el, "scrollHeight", { configurable: true, value: 500 });
  Object.defineProperty(el, "clientHeight", { configurable: true, value: 100 });
  return el;
}

describe("syncScrollableFocus", () => {
  it("rend focalisable une zone qui défile sans contenu focalisable, puis retire ce qu'elle a posé", () => {
    const el = zone("<p>Un long texte</p>");
    syncScrollableFocus(el);
    expect(el.tabIndex).toBe(0);
    expect(el).toHaveAttribute("data-scroll-focus");

    // Un contrôle apparaît dans la zone : il suffit au clavier.
    el.innerHTML = "<button>Valider</button>";
    syncScrollableFocus(el);
    expect(el).not.toHaveAttribute("tabindex");
    expect(el).not.toHaveAttribute("data-scroll-focus");
  });

  it("laisse une zone qui ne défile pas (overflow visible) et un tabindex fourni par l'appelant", () => {
    const visible = zone("<p>Texte</p>", "visible");
    syncScrollableFocus(visible);
    expect(visible).not.toHaveAttribute("tabindex");

    const fourni = zone("<button>Ok</button>");
    fourni.tabIndex = -1;
    syncScrollableFocus(fourni);
    expect(fourni.getAttribute("tabindex")).toBe("-1");
  });
});
