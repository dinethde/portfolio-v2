export interface FooterLink {
  label: string;
  /** A link whose href is "TODO" has no URL yet and is left out. */
  href: string;
}

export interface FooterCardProps {
  name: string;
  /** "Say hi", the warm button. */
  primaryAction: FooterLink;
  /** "Resume", the quiet button. */
  secondaryAction: FooterLink;
  /** Link columns, left to right. */
  columns: FooterLink[][];
}
