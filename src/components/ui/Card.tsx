import { cn } from "../../lib/cn";

/** Props for Card and its parts. */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** When true, adds a hover lift + brand border for interactive cards. */
  interactive?: boolean;
}

/**
 * Card — the base surface for value props, events, and steps.
 * Rounded, lifted, warm border. `interactive` adds hover motion.
 */
export function Card({
  className,
  interactive = false,
  ...props
}: CardProps): JSX.Element {
  return (
    <div
      className={cn(
        "rounded-3xl border-2 border-ink/10 bg-white shadow-card",
        interactive &&
          "transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift",
        className,
      )}
      {...props}
    />
  );
}

/** Card header region. */
export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn("p-6 pb-3", className)} {...props} />;
}

/** Card body region. */
export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

/** Card footer region. */
export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
}
