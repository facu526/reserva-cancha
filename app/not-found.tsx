import { ButtonLink } from "@/components/ButtonLink";

export default function NotFound() {
  return (
    <main className="container-page grid min-h-screen place-items-center">
      <section className="max-w-md rounded-xl border border-black/8 bg-white p-8 text-center shadow-soft">
        <p className="font-semibold text-field-700">404</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">No encontramos esta página</h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">La cancha o sección que buscás no está disponible en este momento.</p>
        <ButtonLink href="/canchas" className="mt-6">
          Ver canchas
        </ButtonLink>
      </section>
    </main>
  );
}
