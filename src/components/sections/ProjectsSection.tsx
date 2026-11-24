import { ProjectCard } from "@/components/project-card/ProjectCard";
import { Reveal } from "@/components/ui/Reveal";
import { RevealGroup } from "@/components/ui/RevealGroup";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { projects as projectsContent } from "@/content/projects";

import type { ProjectsSectionProps } from "./ProjectsSection.types";

// Figma 93:2166 (desktop). Header with its divider, then the cards 64 apart. The cards' glows sit
// behind them with no stacking context (STATE D-54), so nothing here may be isolated, transformed,
// filtered or have an opaque background.

export function ProjectsSection({ content = projectsContent }: ProjectsSectionProps) {
  const { header, items } = content;

  return (
    <section id="projects" aria-labelledby="projects-title" className="flex flex-col gap-64">
      <Reveal>
        <SectionHeader
          variant="section"
          titleId="projects-title"
          eyebrow={header.eyebrow}
          title={header.title}
          description={header.description}
          divider
        />
      </Reveal>
      <RevealGroup className="flex flex-col gap-64">
        {items.map((item) => (
          <Reveal key={item.title}>
            <ProjectCard
              title={item.title}
              tag={item.tag}
              description={item.description}
              image={{ src: item.image.image, alt: item.image.alt }}
              glow={item.glow}
              href={item.href}
            />
          </Reveal>
        ))}
      </RevealGroup>
    </section>
  );
}
