import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary";
};

export function ButtonLink({ className, variant = "primary", ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition focus-ring",
        variant === "primary" && "bg-field-600 text-white hover:bg-field-700",
        variant === "secondary" && "border border-black/10 bg-white text-ink hover:bg-field-50",
        className
      )}
      {...props}
    />
  );
}
