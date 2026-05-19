"use client";

import { Trash2 } from "lucide-react";
import { deleteReservation } from "@/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { cn } from "@/lib/utils";

export function DeleteReservationForm({
  reservationId,
  isCancelled = false,
  className
}: {
  reservationId: string;
  isCancelled?: boolean;
  className?: string;
}) {
  return (
    <form
      action={deleteReservation}
      onSubmit={(event) => {
        if (!window.confirm("¿Seguro que querés eliminar esta reserva? Esta acción no se puede deshacer.")) {
          event.preventDefault();
        }
      }}
      className={className}
    >
      <input type="hidden" name="id" value={reservationId} />
      <SubmitButton
        pendingText="Eliminando..."
        className={cn(
          "gap-1.5 border px-3 py-2 text-xs",
          isCancelled
            ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            : "border-black/10 bg-white text-red-700 hover:bg-red-50"
        )}
      >
        <Trash2 size={14} />
        Eliminar
      </SubmitButton>
    </form>
  );
}
