import { graphqlClient } from '@/lib/graphql-client';
import { GET_CATEGORIES } from '@/lib/queries';

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export default async function TestCategoriesPage() {
  let categories: Category[] = [];
  let error: string | null = null;

  try {
    const data = await graphqlClient.request(GET_CATEGORIES) as { productCategories: { nodes: Category[] } };
    categories = data.productCategories?.nodes || [];
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
    console.error('Error:', e);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-4">Categories Debug Page</h1>
        
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        ) : null}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Found {categories.length} categories
          </h2>

          {categories.length === 0 ? (
            <p className="text-gray-600">
              No categories found. Please create some product categories in WordPress.
            </p>
          ) : (
            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.id} className="border-b pb-4">
                  <h3 className="font-semibold text-lg">{cat.name}</h3>
                  <p className="text-sm text-gray-600">Slug: {cat.slug}</p>
                  <p className="text-sm text-gray-600">Product Count: {cat.count}</p>
                  <a 
                    href={`/category/${cat.slug}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Visit Category Page →
                  </a>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">How to fix 404 errors:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Make sure you have product categories created in WordPress</li>
              <li>Go to WordPress Admin → Products → Categories</li>
              <li>Create at least one category</li>
              <li>Assign some products to that category</li>
              <li>Use the exact slug shown above in your URL</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

