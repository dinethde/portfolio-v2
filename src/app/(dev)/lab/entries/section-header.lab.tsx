import { RichText } from "@/components/ui/RichText";
import { SectionHeader } from "@/components/ui/SectionHeader";

// Both styles of Figma 92:2296, with the optional parts on and off, then every run tone.

export const title = "Section header";

// Figma 111:4646: 24px and 22px, with 3px and 4px of padding under them.
const emoji = (
  <>
    <span className="pb-3 text-[24px] leading-[24px]">✌🏻</span>
    <span className="pb-4 text-[22px] leading-[24px]">👀</span>
  </>
);

const heading = "Artistic Designer &\nSoftware Engineer";

export function Lab() {
  return (
    <div className="flex max-w-700 flex-col gap-48">
      <SectionHeader
        variant="hero"
        eyebrow="Hi, I'm Dineth De Silva"
        title={heading}
        icons={emoji}
      />
      <SectionHeader
        variant="section"
        eyebrow="Hi, I'm Dineth De Silva"
        title={heading}
        description="Fun things I'm working on when it's not client work."
        divider
      />
      <div className="pb-48">
        <SectionHeader variant="section" eyebrow="Story" title="A few things about me" underline />
      </div>
      <p className="font-rounded text-p2 text-txt-neutral-p3-active">
        <RichText
          runs={[
            { text: "plain, " },
            { text: "strong", tone: "strong", weight: "medium" },
            { text: ", " },
            { text: "brand", tone: "brand" },
            { text: ", " },
            { text: "secondary", tone: "secondary", weight: "semibold" },
            { text: " and " },
            { text: "error", tone: "error" },
          ]}
        />
      </p>
    </div>
  );
}
