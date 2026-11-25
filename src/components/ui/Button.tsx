import type { ButtonProps, ButtonVariant } from "./Button.types";

// Figma 92:2148. Only the colours change between states; nothing moves (DESIGN.md "Button").
// Hover, pressed and focus are CSS states, so the lab can force them with data-force-state.

const base =
  "inline-flex items-center rounded-8 px-16 py-4 font-rounded text-p2 font-medium whitespace-nowrap transition-colors focus-visible:focus-ring active:ring-1 active:ring-offset-1 active:ring-offset-surface-neutral-light-active";

const variants: Record<ButtonVariant, string> = {
  "primary-light":
    "bg-btn-primary-light-default-bg text-btn-primary-light-default-text hover:bg-btn-primary-light-hover-bg hover:text-btn-primary-light-hover-text active:bg-btn-primary-light-active-bg active:text-btn-primary-light-active-text active:ring-btn-primary-light-active-ring",
  secondary:
    "bg-btn-secondary-light-default-bg text-btn-secondary-light-default-text hover:bg-btn-secondary-light-hover-bg hover:text-btn-secondary-light-hover-text active:bg-btn-secondary-light-active-bg active:text-btn-secondary-light-active-text active:ring-btn-secondary-light-active-ring",
};

export function Button({ variant, className, ...props }: ButtonProps) {
  const classes = [base, variants[variant], className].filter(Boolean).join(" ");

  if (props.href !== undefined) {
    return <a {...props} className={classes} />;
  }
  return <button type="button" {...props} className={classes} />;
}
