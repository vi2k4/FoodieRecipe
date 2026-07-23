export default function Home() {
  return (
    <main className="flex items-center justify-center px-6 py-16 text-neutral-900">
      <section className="max-w-xl space-y-4 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
          FoodiRecipe
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Frontend scaffold is ready.
        </h1>
        <p className="text-base leading-7 text-neutral-600">
          The web folder now includes the missing route groups and shared
          folders from the target structure.
        </p>
      </section>
    </main>
  );
}
