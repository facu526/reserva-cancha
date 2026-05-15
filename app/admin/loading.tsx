export default function AdminLoading() {
  return (
    <main className="container-page grid min-h-screen place-items-center">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-field-100 border-t-field-600" />
        <p className="mt-4 text-sm font-medium text-ink/60">Cargando panel...</p>
      </div>
    </main>
  );
}
