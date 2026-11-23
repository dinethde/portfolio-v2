import type { ReactNode } from "react";

interface PillBaseProps {
  /** A SocialIcon or TechIcon, shown before the label. */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A social pill: an external link to a profile. */
export interface PillLinkProps extends PillBaseProps {
  href: string;
}

/** A tool pill: a plain label with no hover and no link. */
export interface PillStaticProps extends PillBaseProps {
  href?: never;
}

export type PillProps = PillLinkProps | PillStaticProps;
