import { useEffect, useState } from "react";

export const SECTION_IDS = ["achievements", "story", "projects", "about", "contact"] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>(SECTION_IDS[0]);

  // subscription: IntersectionObserver over the page section anchors
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id as SectionId);
        }
      },
      { rootMargin: "-40% 0px -60% 0px" },
    );
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return active;
}
