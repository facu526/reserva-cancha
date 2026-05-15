"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  children: ReactNode;
  pendingText?: string;
  className?: string;
};

export function SubmitButton({ children, pendingText = "Guardando...", className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "focus-ring inline-flex items-center justify-center rounded-lg text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      {pending ? pendingText : children}
    </button>
  );
}
