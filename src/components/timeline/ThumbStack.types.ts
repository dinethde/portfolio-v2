import type { StaticImageData } from "next/image";

export interface ThumbImage {
  image: StaticImageData;
  alt: string;
}

export interface ThumbStackProps {
  /** Up to three pictures. The first is the front card; the others sit behind it. */
  thumbs: ThumbImage[];
  className?: string;
}
