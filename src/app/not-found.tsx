import { NotFoundSection } from "@/components/sections/NotFoundSection";

// TECH_SPEC §2: a small 404 in the page's style, with the home page's top padding. No menu: it
// belongs to the page (STATE D-59).
export default function NotFound() {
  return (
    <div className="flex flex-col items-center px-16 pt-96 pb-128 tablet:pt-120 desktop:pt-128">
      <NotFoundSection />
    </div>
  );
}
