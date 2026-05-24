import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SoundPreviewButton from "../SoundPreviewButton";

describe("SoundPreviewButton", () => {
  it("renders a button with the correct aria-label", () => {
    render(<SoundPreviewButton sound="chime" />);
    const button = screen.getByRole("button", { name: /preview chime sound/i });
    expect(button).toBeInTheDocument();
  });

  it("renders a button with the correct aria-label for bell", () => {
    render(<SoundPreviewButton sound="bell" />);
    const button = screen.getByRole("button", { name: /preview bell sound/i });
    expect(button).toBeInTheDocument();
  });

  it("has type button to prevent form submission", () => {
    render(<SoundPreviewButton sound="chime" />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });

  it("has the correct title attribute", () => {
    render(<SoundPreviewButton sound="chime" />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Preview chime sound");
  });

  it("renders a play icon SVG", () => {
    const { container } = render(<SoundPreviewButton sound="bell" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("is clickable without throwing", async () => {
    const user = userEvent.setup();
    render(<SoundPreviewButton sound="chime" />);
    const button = screen.getByRole("button");
    // Should not throw when clicked (audio may fail in jsdom, but that's OK)
    await expect(user.click(button)).resolves.toBeUndefined();
  });
});
