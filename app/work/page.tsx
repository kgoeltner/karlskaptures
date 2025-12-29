import { getCategoriesWithCovers } from "../utils/photos";
import CategoryGrid from "../components/CategoryGrid";

export default async function WorkPage() {
  const categories = await getCategoriesWithCovers();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 pb-24">
      <h1 className="text-3xl font-semibold">Portfolio</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Browse by category.
      </p>

      <CategoryGrid categories={categories} />
    </main>
  );
}
  