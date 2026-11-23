import type { ThumbImage } from "./ThumbStack.types";

export interface ProjectRowProps {
  title: string;
  description: string;
  thumbs: ThumbImage[];
  /** Makes the whole row a link. */
  href?: string;
  className?: string;
}
