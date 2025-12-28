import Link from "next/link";
import { getCategoriesWithCovers } from "../utils/photos";

export default async function WorkPage() {
  const categories = await getCategoriesWithCovers();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Portfolio</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Browse by category.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={`/work/${category.id}`}
            className={`group ${index % 2 === 1 ? 'mt-12' : ''}`}
          >
            <div className="overflow-hidden bg-neutral-900 transition-transform group-hover:scale-[1.02]">
              <img
                src={category.coverImage}
                alt={category.label}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-4 text-center text-2xl font-medium text-neutral-300">
              {category.label}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
  