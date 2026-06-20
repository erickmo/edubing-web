import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Badge variants — small sticker-style labels for event types, prices,
 * and eyebrow tags. Colors map to the event_type taxonomy.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold leading-tight",
  {
    variants: {
      variant: {
        brand: "bg-brand-100 text-brand-700",
        teal: "bg-teal-100 text-teal-700",
        sun: "bg-sun-soft text-ink",
        ink: "bg-ink text-cream",
        outline: "border-2 border-ink text-ink",
      },
    },
    defaultVariants: { variant: "brand" },
  },
);

/** Props for Badge. */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/** Small pill label. */
export function Badge({ className, variant, ...props }: BadgeProps): JSX.Element {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
