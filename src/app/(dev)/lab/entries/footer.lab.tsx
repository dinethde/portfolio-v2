import { FooterCard } from "@/components/footer/FooterCard";
import { FooterCta } from "@/components/footer/FooterCta";

// Figma 351:8691: the sign-off line, then the footer card (it stacks below 600px).

export const title = "Footer";

const columns = [
  [
    { label: "Achievements", href: "#achievements" },
    { label: "Story so far", href: "#story" },
    { label: "Projects", href: "#projects" },
    { label: "About", href: "#about" },
  ],
  [
    { label: "X (Twitter)", href: "https://x.com/dinethr_de" },
    { label: "GitHub", href: "https://github.com/dinethde" },
    { label: "LinkedIn", href: "TODO" },
  ],
  [
    { label: "Email", href: "mailto:dev.dinethde@gmail.com" },
    { label: "Mobile", href: "tel:+94703242772" },
  ],
];

export function Lab() {
  return (
    <div className="flex flex-col items-center gap-32">
      <FooterCta
        line={{
          before: "I design what I build down to the last pixel. Come say ",
          accent: "hiii",
          after: ".",
        }}
      />
      <FooterCard
        name="Dineth De Silva"
        primaryAction={{ label: "Say hi", href: "mailto:dev.dinethde@gmail.com" }}
        secondaryAction={{ label: "Resume", href: "/resume.pdf" }}
        columns={columns}
      />
    </div>
  );
}
