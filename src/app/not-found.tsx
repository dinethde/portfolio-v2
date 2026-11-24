import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { notFound } from "@/content/not-found";

// TECH_SPEC §2: a small 404 in the page's style. The same 600px column and top padding as the page,
// a section header and one link home. No menu: it belongs to the page (STATE D-59).
export default function NotFound() {
  const { heading, homeLabel } = notFound;

  return (
    <div className="flex flex-col items-center px-16 pt-96 pb-128 tablet:pt-120 desktop:pt-128">
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
    </div>
  );
}
