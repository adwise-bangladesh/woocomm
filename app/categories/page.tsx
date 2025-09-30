import { graphqlClient } from '@/lib/graphql-client';
import { GET_CATEGORIES } from '@/lib/queries';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 60;

async function getCategories() {
  try {
    const data: any = await graphqlClient.request(GET_CATEGORIES);
    return data.productCategories.nodes || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">All Categories</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category: any) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group block bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Image
                  src={category.image?.sourceUrl || '/placeholder.png'}
                  alt={category.image?.altText || category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} items</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
