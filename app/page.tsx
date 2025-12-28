import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-semibold">Karlskaptures</h1>
      <p className="mt-3 text-neutral-500">
        Photography by Karl Goeltner
      </p>

      <Link
        href="/work"
        className="mt-6 rounded-full border border-neutral-700 px-6 py-3 text-sm hover:bg-neutral-900"
      >
        View Work
      </Link>
    </main>
  );
}
