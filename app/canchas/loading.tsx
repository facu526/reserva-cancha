export default function CourtsLoading() {
  return (
    <main className="container-page py-12">
      <div className="mb-8 h-28 max-w-xl animate-pulse rounded-xl bg-field-100" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div className="h-96 animate-pulse rounded-xl bg-white shadow-soft" key={item} />
        ))}
      </div>
    </main>
  );
}
