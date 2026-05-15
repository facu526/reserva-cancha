"use client";

import { RotateCcw } from "lucide-react";

export default function ErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container-page grid min-h-screen place-items-center">
      <section className="max-w-md rounded-xl border border-red-200 bg-white p-8 text-center shadow-soft">
        <h1 className="text-2xl font-bold text-ink">No pudimos cargar esta sección</h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          Intentá nuevamente en unos segundos. Si el problema continúa, comunicate con el club.
        </p>
        <button
          onClick={reset}
          className="focus-ring mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-field-600 px-5 py-3 text-sm font-semibold text-white hover:bg-field-700"
        >
          <RotateCcw size={18} />
          Reintentar
        </button>
      </section>
    </main>
  );
}
