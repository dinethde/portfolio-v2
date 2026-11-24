import type { StaticImageData } from "next/image";

export type ProjectGlow = "blue-base" | "warm-right" | "warm-left";

export interface ProjectCardImage {
  src: string | StaticImageData;
  alt: string;
}

export interface ProjectCardProps {
  title: string;
  /** Short label on the right of the header, e.g. the company. */
  tag?: string;
  /** One or two lines under the picture. */
  description?: string;
  image: ProjectCardImage;
  /** Which cloud of light sits behind the picture. Neighbouring cards use different ones. */
  glow: ProjectGlow;
  /** When set, the whole card is the link. */
  href?: string;
  className?: string;
}
