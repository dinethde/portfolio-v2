import { SiteMenu } from "@/components/menu/SiteMenu";
import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { IntroSection } from "@/components/sections/IntroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { StorySection } from "@/components/sections/StorySection";
import { menuContacts, nav } from "@/content/nav";
import { site } from "@/content/site";
import { getContributions } from "@/lib/github/contributions";

// The one page (ARCHITECTURE §2). Static, refreshed at most every 6 hours (STATE D-04); the chart
// data never throws, it falls back to the saved JSON. One 600px column with 96px between sections
// (DESIGN.md "Layout"); the footer area is 750px wide.

export const revalidate = 21600;

export default async function Home() {
  const contributions = await getContributions(process.env.GITHUB_LOGIN ?? site.github.handle);

  return (
    <>
      {/* The menu lives on the page, not the layout, so the lab and the 404 page don't get it. */}
      <SiteMenu links={nav} contacts={menuContacts} />
      <div className="flex flex-col items-center gap-96 px-16 pt-96 pb-128 tablet:pt-120 desktop:pt-128">
        <div className="flex w-full max-w-600 flex-col gap-96">
          <IntroSection contributions={contributions} />
          <StorySection />
          <ProjectsSection />
          <AboutSection />
        </div>
        <div className="w-full max-w-750">
          <ContactSection />
        </div>
      </div>
    </>
  );
}
