export interface FooterCtaProps {
  /** The sentence around the accent word, from `contact.line`. */
  line: {
    /** The first sentence; a line break follows it from tablet up. */
    lead?: string;
    before: string;
    accent: string;
    after: string;
  };
}
