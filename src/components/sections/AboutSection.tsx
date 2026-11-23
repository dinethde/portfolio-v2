import { TechIcon } from "@/components/ui/icons";
import type { TechIconName } from "@/components/ui/icons/TechIcon.types";
import { Pill } from "@/components/ui/Pill";
import { Reveal } from "@/components/ui/Reveal";
import { RevealGroup } from "@/components/ui/RevealGroup";
import { RichText } from "@/components/ui/RichText";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { about as aboutContent } from "@/content/about";

import type { AboutSectionProps } from "./AboutSection.types";

// Figma 93:2181 (desktop) and 277:4760 (phone). The moodboard is hidden in Figma (STATE O8), so
// there are no photos. Tools and interests sit side by side, and stack on phones (DESIGN.md).

function techIconName(label: string): TechIconName | undefined {
  const names: Record<string, TechIconName> = {
    React: "react",
    "TanStack Start": "tanstack",
    TypeScript: "typescript",
    Go: "go",
    Rust: "rust",
    PostgreSQL: "postgresql",
    Docker: "docker",
    Figma: "figma",
    Python: "python",
  };
  return names[label];
}

const itemTitle = "font-rounded text-p2 font-medium text-txt-neutral-p1-active";

export function AboutSection({ content = aboutContent }: AboutSectionProps) {
  const { header, bio, tools, interests } = content;

  return (
    <section id="about" aria-labelledby="about-title" className="flex flex-col gap-32">
      <Reveal>
        <SectionHeader
          variant="section"
          titleId="about-title"
          eyebrow={header.eyebrow}
          title={header.title}
          description={header.description}
        />
      </Reveal>
      <RevealGroup className="flex flex-col gap-16">
        {bio.map((runs, index) => (
          <Reveal key={runs[0]?.text ?? index}>
            <p
              className={`font-rounded text-p2 ${
                index === bio.length - 1
                  ? "text-txt-neutral-p2-active"
                  : "text-txt-neutral-p3-active"
              }`}
            >
              <RichText runs={runs} />
            </p>
          </Reveal>
        ))}
      </RevealGroup>
      <Reveal className="flex flex-col gap-32 tablet:flex-row tablet:gap-24">
        <div className="flex flex-col gap-12 tablet:w-314 tablet:shrink-0">
          <h3 className={itemTitle}>{tools.title}</h3>
          <p className="font-rounded text-p2 leading-[2.8] text-txt-neutral-p2-active">
            {tools.sentence.map((part, index) => {
              if (part.kind === "text") {
                // biome-ignore lint/suspicious/noArrayIndexKey: static list
                return <span key={index}>{part.text}</span>;
              }
              const name = techIconName(part.label);
              return (
                <Pill
                  // biome-ignore lint/suspicious/noArrayIndexKey: static list
                  key={index}
                  className="align-middle"
                  icon={name ? <TechIcon name={name} /> : undefined}
                >
                  {part.label}
                </Pill>
              );
            })}
          </p>
        </div>
        <div className="flex flex-col gap-12 tablet:min-w-0 tablet:flex-1">
          <h3 className={itemTitle}>{interests.title}</h3>
          <ul className="list-disc pl-21 font-rounded text-p2 text-txt-neutral-p2-active">
            {interests.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
