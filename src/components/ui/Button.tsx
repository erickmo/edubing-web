import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Button variant definitions for the Edubing design system.
 * `primary` = tangerine sticker CTA, `secondary` = ink outline,
 * `ghost` = quiet inline action, `soft` = tinted fill for in-card actions.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-500 text-white shadow-lift hover:bg-brand-600 hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "border-2 border-ink bg-cream text-ink hover:bg-ink hover:text-cream hover:-translate-y-0.5 active:translate-y-0",
        soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
        ghost: "text-ink hover:bg-ink/5",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

/** Props for Button. `asChild` renders the styles onto a child element (e.g. <a>). */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * Polymorphic button. Use `asChild` to apply button styling to links
 * (e.g. react-router <Link>) while preserving correct semantics.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
