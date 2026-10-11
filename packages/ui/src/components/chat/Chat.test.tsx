import * as React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Field } from "../field/Field";
import {
  ChatComposer,
  Message,
  MessageAttachment,
  MessageDateSeparator,
  MessageGroup,
  MessageList,
  TypingIndicator,
  formatMessageDate,
} from "./Chat";

/** jsdom ne calcule aucune géométrie : on simule celle du fil. */
function mockScroll(el: HTMLElement, { scrollHeight = 1000, clientHeight = 300, scrollTop = 700 } = {}) {
  const state = { scrollTop, scrollHeight };
  Object.defineProperty(el, "clientHeight", { configurable: true, get: () => clientHeight });
  Object.defineProperty(el, "scrollHeight", { configurable: true, get: () => state.scrollHeight });
  Object.defineProperty(el, "scrollTop", {
    configurable: true,
    get: () => state.scrollTop,
    set: (value: number) => {
      state.scrollTop = Math.max(0, Math.min(value, state.scrollHeight - clientHeight));
    },
  });
  return {
    state,
    scrollTo(top: number) {
      state.scrollTop = top;
      fireEvent.scroll(el);
    },
  };
}

function Conversation({ messages }: { messages: { id: string; from: "me" | "them"; text: string }[] }) {
  return (
    <MessageList aria-label="Conversation avec Inès" style={{ height: 300 }}>
      {messages.map((m) => (
        <MessageGroup key={m.id} from={m.from} name={m.from === "them" ? "Inès Benali" : undefined}>
          <Message>{m.text}</Message>
        </MessageGroup>
      ))}
    </MessageList>
  );
}

describe("MessageList", () => {
  it("est un journal nommé, poli, focalisable au clavier", async () => {
    render(<Conversation messages={[{ id: "1", from: "them", text: "Bonjour" }]} />);
    const log = screen.getByRole("log", { name: "Conversation avec Inès" });
    expect(log).toHaveAttribute("aria-live", "polite");
    expect(log).toHaveAttribute("aria-relevant", "additions");
    await userEvent.setup().tab();
    expect(log).toHaveFocus();
  });

  it("propose de revenir en bas quand on lit plus haut, puis signale les nouveaux messages", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Conversation messages={[{ id: "1", from: "them", text: "Bonjour" }]} />);
    const log = screen.getByRole("log");
    const scroll = mockScroll(log);
    expect(screen.queryByRole("button", { name: "Revenir aux derniers messages" })).toBeNull();

    scroll.scrollTo(200);
    const jump = screen.getByRole("button", { name: "Revenir aux derniers messages" });
    expect(jump).not.toHaveAttribute("data-unread");

    // Un message reçu pendant la lecture : on ne déplace pas le lecteur, on le signale.
    scroll.state.scrollHeight = 1100;
    rerender(
      <Conversation
        messages={[
          { id: "1", from: "them", text: "Bonjour" },
          { id: "2", from: "them", text: "Tu as vu le devis ?" },
        ]}
      />,
    );
    expect(scroll.state.scrollTop).toBe(200);
    const pill = screen.getByRole("button", { name: /Nouveaux messages/ });
    expect(pill).toHaveAttribute("data-unread", "true");

    pill.focus();
    await user.keyboard("{Enter}");
    expect(scroll.state.scrollTop).toBe(800);
    expect(screen.queryByRole("button", { name: /Nouveaux messages/ })).toBeNull();
    // Le bouton a disparu : le focus clavier se pose sur le fil.
    expect(log).toHaveFocus();
  });

  it("reste collé en bas quand l'utilisateur y est", () => {
    const { rerender } = render(<Conversation messages={[{ id: "1", from: "them", text: "Bonjour" }]} />);
    const scroll = mockScroll(screen.getByRole("log"));
    scroll.scrollTo(700);
    scroll.state.scrollHeight = 1100;
    rerender(
      <Conversation
        messages={[
          { id: "1", from: "them", text: "Bonjour" },
          { id: "2", from: "them", text: "Tu es là ?" },
        ]}
      />,
    );
    expect(scroll.state.scrollTop).toBe(800);
  });

  it("un message envoyé ramène toujours en bas", () => {
    const { rerender } = render(<Conversation messages={[{ id: "1", from: "them", text: "Bonjour" }]} />);
    const scroll = mockScroll(screen.getByRole("log"));
    scroll.scrollTo(100);
    scroll.state.scrollHeight = 1100;
    rerender(
      <Conversation
        messages={[
          { id: "1", from: "them", text: "Bonjour" },
          { id: "2", from: "me", text: "Salut !" },
        ]}
      />,
    );
    expect(scroll.state.scrollTop).toBe(800);
  });

  it("appelle onReachTop une fois par arrivée en haut", () => {
    const onReachTop = vi.fn();
    render(
      <MessageList onReachTop={onReachTop}>
        <Message>Bonjour</Message>
      </MessageList>,
    );
    const scroll = mockScroll(screen.getByRole("log"));
    scroll.scrollTo(30);
    scroll.scrollTo(10);
    expect(onReachTop).toHaveBeenCalledTimes(1);
    scroll.scrollTo(400);
    scroll.scrollTo(0);
    expect(onReachTop).toHaveBeenCalledTimes(2);
  });

  it("signale le chargement de l'historique", () => {
    render(
      <MessageList loadingHistory>
        <Message>Bonjour</Message>
      </MessageList>,
    );
    expect(screen.getByRole("log", { name: "Conversation" })).toHaveAttribute("aria-busy", "true");
  });
});

describe("MessageGroup et Message", () => {
  it("seul le dernier message du groupe porte la queue et l'avatar", () => {
    const { container } = render(
      <MessageGroup from="them" name="Inès Benali" avatar={<span data-testid="avatar">IB</span>}>
        <Message>Un</Message>
        <Message>Deux</Message>
        <Message>Trois</Message>
      </MessageGroup>,
    );
    const messages = container.querySelectorAll("[data-slot=message]");
    expect([...messages].map((m) => m.getAttribute("data-position"))).toEqual(["first", "middle", "last"]);
    expect(messages[0]!.querySelector(".ui-message__tail")).toBeNull();
    expect(messages[1]!.querySelector(".ui-message__tail")).toBeNull();
    expect(messages[2]!.querySelector(".ui-message__tail")).not.toBeNull();
    expect(screen.getAllByTestId("avatar")).toHaveLength(1);
    expect(within(messages[2] as HTMLElement).getByTestId("avatar")).toBeInTheDocument();
    // Les emplacements vides alignent les bulles ; l'avatar est décoratif.
    expect(messages[0]!.querySelector(".ui-message__avatar")).toHaveAttribute("aria-hidden", "true");
  });

  it("annonce l'expéditeur avant chaque message ; le nom visible n'est pas relu", () => {
    const { container } = render(
      <>
        <MessageGroup from="them" name="Inès Benali">
          <Message>Bonjour</Message>
        </MessageGroup>
        <MessageGroup from="me">
          <Message>Salut</Message>
        </MessageGroup>
      </>,
    );
    const [received, sent] = container.querySelectorAll("[data-slot=message]");
    expect(received).toHaveTextContent("Inès Benali : Bonjour");
    expect(received).toHaveAttribute("data-from", "them");
    expect(sent).toHaveTextContent("Vous : Salut");
    expect(sent).toHaveAttribute("data-from", "me");
    expect(container.querySelector(".ui-message-group__name")).toHaveAttribute("aria-hidden", "true");
  });

  it("affiche le statut d'un message envoyé", () => {
    const { rerender } = render(<Message from="me" status="sending">Salut</Message>);
    expect(screen.getByText("Envoi…")).toBeInTheDocument();
    rerender(<Message from="me" status="sent">Salut</Message>);
    expect(screen.getByText("Envoyé")).toBeInTheDocument();
    rerender(<Message from="me" status="read">Salut</Message>);
    expect(screen.getByText("Lu")).toBeInTheDocument();
  });

  it("en échec, propose « Réessayer » au clavier", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <Message from="me" status="failed" onRetry={onRetry}>
        Salut
      </Message>,
    );
    expect(screen.getByText("Non envoyé")).toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole("button", { name: "Réessayer" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("horodatage : lu en permanence, visible au survol ou sous la bulle", () => {
    const time = new Date(2026, 9, 11, 14, 2);
    const { container, rerender } = render(<Message time={time}>Bonjour</Message>);
    const reveal = container.querySelector(".ui-message__time-reveal time");
    expect(reveal).toHaveTextContent("14:02");
    expect(reveal).toHaveAttribute("dateTime", time.toISOString());
    rerender(
      <Message time={time} showTime>
        Bonjour
      </Message>,
    );
    expect(container.querySelector(".ui-message__time-reveal")).toBeNull();
    expect(container.querySelector(".ui-message__footer time")).toHaveTextContent("14:02");
  });

  it("pièces jointes au-dessus de la bulle, fichier en lien", () => {
    render(
      <Message from="me" attachments={<MessageAttachment name="Devis.pdf" meta="PDF · 284 Ko" href="#devis" />}>
        Voici le devis
      </Message>,
    );
    expect(screen.getByRole("link", { name: /Devis\.pdf/ })).toHaveAttribute("href", "#devis");
  });
});

describe("MessageDateSeparator", () => {
  const now = new Date(2026, 9, 11, 10, 0);
  it("formate les jours en français", () => {
    expect(formatMessageDate(new Date(2026, 9, 11, 8, 0), now)).toBe("Aujourd'hui");
    expect(formatMessageDate(new Date(2026, 9, 10, 23, 0), now)).toBe("Hier");
    expect(formatMessageDate(new Date(2026, 9, 7), now)).toBe("Mercredi");
    expect(formatMessageDate(new Date(2026, 8, 2), now)).toBe("Mercredi 2 septembre");
    expect(formatMessageDate(new Date(2025, 11, 24), now)).toBe("24 décembre 2025");
  });

  it("rend une date lisible par les machines", () => {
    render(<MessageDateSeparator date={new Date(2026, 9, 10)} now={now} />);
    expect(screen.getByText("Hier")).toHaveAttribute("dateTime", "2026-10-10");
  });
});

describe("TypingIndicator", () => {
  it("annonce qui écrit ; seul, c'est un statut", () => {
    render(<TypingIndicator name="Inès" />);
    expect(screen.getByRole("status")).toHaveTextContent("Inès est en train d'écrire");
  });

  it("dans le fil, le journal suffit à l'annoncer", () => {
    render(
      <MessageList>
        <TypingIndicator name="Inès" />
      </MessageList>,
    );
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByRole("log")).toHaveTextContent("Inès est en train d'écrire");
  });
});

describe("ChatComposer", () => {
  it("Entrée envoie, Maj+Entrée va à la ligne, le champ se vide et garde le focus", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} />);
    const input = screen.getByRole("textbox", { name: "Message" });
    const send = screen.getByRole("button", { name: "Envoyer" });
    expect(send).toBeDisabled();

    await user.click(input);
    await user.keyboard("Bonjour{Shift>}{Enter}{/Shift}à demain");
    expect(input).toHaveValue("Bonjour\nà demain");
    expect(send).toBeEnabled();
    await user.keyboard("{Enter}");
    expect(onSend).toHaveBeenCalledWith("Bonjour\nà demain");
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(send).toBeDisabled();
  });

  it("n'envoie ni texte vide ni espaces, et respecte la composition IME", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} />);
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.keyboard("   {Enter}");
    expect(onSend).not.toHaveBeenCalled();
    await user.keyboard("été");
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("le bouton rond envoie aussi", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} />);
    await user.type(screen.getByRole("textbox"), "Salut");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));
    expect(onSend).toHaveBeenCalledWith("Salut");
  });

  it("pendant un envoi asynchrone : en attente, puis vidé ; rejeté, le texte reste", async () => {
    const user = userEvent.setup();
    let settle!: { resolve: () => void; reject: () => void };
    const onSend = vi.fn(
      () =>
        new Promise<void>((resolve, reject) => {
          settle = { resolve, reject: () => reject(new Error("Réseau")) };
        }),
    );
    render(<ChatComposer onSend={onSend} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "Premier{Enter}");
    const send = screen.getByRole("button", { name: "Envoyer" });
    expect(send).toHaveAttribute("aria-busy", "true");
    expect(input).toHaveAttribute("readonly");
    await act(async () => settle.resolve());
    expect(input).toHaveValue("");
    expect(input).not.toHaveAttribute("readonly");

    await user.type(input, "Second{Enter}");
    await act(async () => settle.reject());
    expect(input).toHaveValue("Second");
  });

  it("contrôlé : la valeur vient du parent", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = React.useState("Brouillon");
      return <ChatComposer value={value} onValueChange={setValue} onSend={() => {}} />;
    }
    render(<Controlled />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("Brouillon");
    await user.click(input);
    await user.keyboard("{Enter}");
    expect(input).toHaveValue("");
  });

  it("actions à gauche, désactivé, et intégration à un Field", () => {
    const { rerender } = render(
      <ChatComposer actions={<button type="button">Joindre</button>} disabled />,
    );
    expect(screen.getByRole("button", { name: "Joindre" })).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeDisabled();
    rerender(
      <Field label="Réponse" hint="Entrée pour envoyer">
        <ChatComposer />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Réponse" });
    expect(input).toHaveAccessibleDescription("Entrée pour envoyer");
  });
});

describe("Messagerie — accessibilité", () => {
  it("conversation complète et zone de saisie sans violation", async () => {
    const now = new Date(2026, 9, 11, 10, 0);
    const { container } = render(
      <div>
        <MessageList style={{ height: 400 }}>
          <MessageDateSeparator date={now} now={now} />
          <MessageGroup from="them" name="Inès Benali" avatar={<span>IB</span>}>
            <Message time={now}>Bonjour !</Message>
            <Message time={now} attachments={<MessageAttachment name="Devis.pdf" meta="PDF · 284 Ko" href="#devis" />}>
              Voici le devis.
            </Message>
          </MessageGroup>
          <MessageGroup from="me">
            <Message status="read">Merci, je regarde.</Message>
            <Message status="failed" onRetry={() => {}}>
              Je reviens vers toi.
            </Message>
          </MessageGroup>
          <TypingIndicator name="Inès" avatar={<span>IB</span>} />
        </MessageList>
        <ChatComposer actions={<button type="button">Joindre</button>} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
