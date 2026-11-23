import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FooterCard } from "@/components/footer/FooterCard";
import { FooterCta } from "@/components/footer/FooterCta";

afterEach(cleanup);

const columns = [
  [{ label: "About", href: "#about" }],
  [
    { label: "GitHub", href: "https://github.com/x" },
    { label: "LinkedIn", href: "TODO" },
  ],
];

function renderCard() {
  render(
    <FooterCard
      name="Dineth De Silva"
      primaryAction={{ label: "Say hi", href: "mailto:a@b.c" }}
      secondaryAction={{ label: "Resume", href: "/resume.pdf" }}
      columns={columns}
    />,
  );
}

describe("FooterCard", () => {
  it("leaves out links whose href is TODO", () => {
    renderCard();
    expect(screen.queryByText("LinkedIn")).toBeNull();
    expect(screen.getByRole("link", { name: "About" }).getAttribute("href")).toBe("#about");
  });

  it("opens external links safely in a new tab", () => {
    renderCard();
    const link = screen.getByRole("link", { name: "GitHub (opens in new tab)" });
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("shows the current year in the copyright", () => {
    renderCard();
    expect(screen.getByText(`© ${new Date().getFullYear()} Dineth De Silva`)).toBeTruthy();
  });
});

describe("FooterCta", () => {
  it("renders the accent word in an em", () => {
    render(<FooterCta line={{ before: "Say ", accent: "hiii", after: "." }} />);
    expect(screen.getByText("hiii").tagName).toBe("EM");
  });
});
