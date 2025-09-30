import Link from 'next/link';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: {
    sourceUrl: string;
    altText: string;
  };
}

interface CircularCategoriesProps {
  categories: Category[];
}

export default function CircularCategories({ categories }: CircularCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="flex flex-col items-center group"
            >
              <div className="relative w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 mb-2">
                <Image
                  src={category.image?.sourceUrl || '/placeholder.png'}
                  alt={category.image?.altText || category.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 80px, (max-width: 1024px) 112px, 128px"
                />
              </div>
              <span className="text-xs md:text-sm text-center text-gray-700 font-medium line-clamp-2">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
