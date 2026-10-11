import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("bascule et expose son état", async () => {
    render(<Switch aria-label="Notifications" size="sm" />);
    const sw = screen.getByRole("switch", { name: "Notifications" });
    expect(sw).toHaveAttribute("data-size", "sm");
    expect(sw).toHaveAttribute("aria-checked", "false");
    await userEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(<Switch aria-label="Mode avion" defaultChecked />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
