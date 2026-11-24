import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { notFound as notFoundContent } from "@/content/not-found";

import type { NotFoundSectionProps } from "./NotFoundSection.types";

// The 404 body. Figma has no 404 frame, so it is the page's own section header and primary-light
// button in the 600px column (STATE D-61).
export function NotFoundSection({ content = notFoundContent }: NotFoundSectionProps) {
  const { heading, homeLabel } = content;

  return (
    <section
      aria-labelledby="not-found-title"
      className="flex w-full max-w-600 flex-col items-start gap-40"
    >
      <SectionHeader
        variant="section"
        titleId="not-found-title"
        eyebrow={heading.eyebrow}
        title={heading.title}
        description={heading.description}
      />
      <Button variant="primary-light" href="/">
        {homeLabel}
      </Button>
    </section>
  );
}
