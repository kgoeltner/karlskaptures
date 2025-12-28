import { notFound } from "next/navigation";
import Link from "next/link";
import { getPhotosByCategory, categories } from "../../utils/photos";
import { Category } from "../../data/photos";
import PhotoGallery from "../../components/PhotoGallery";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

// Force dynamic rendering to avoid bundling large image files
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  
  const categoryInfo = categories.find((c: { id: string }) => c.id === category);
  
  if (!categoryInfo) {
    notFound();
  }

  const categoryPhotos = await getPhotosByCategory(category as Category);

  return (
    <main className="w-full py-10">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <Link
          href="/work"
          className="mb-6 inline-block text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
        >
          ← Back to Portfolio
        </Link>
        
        <h1 className="text-3xl font-semibold">{categoryInfo.label}</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {categoryPhotos.length} {categoryPhotos.length === 1 ? "photo" : "photos"}
        </p>
      </div>

      <PhotoGallery photos={categoryPhotos} />
    </main>
  );
}

