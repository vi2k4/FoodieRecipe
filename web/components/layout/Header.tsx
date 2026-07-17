import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-neutral-900"
        >
          FoodiRecipe
        </Link>

        <nav className="flex items-center gap-6 text-sm text-neutral-600">
          <Link
            href="/recipes"
            className="transition-colors hover:text-neutral-900"
          >
            Recipes
          </Link>
          <Link
            href="/login"
            className="transition-colors hover:text-neutral-900"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-neutral-900 px-4 py-2 font-medium text-white transition-colors hover:bg-neutral-700"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
