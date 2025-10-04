import { graphqlClient } from '@/lib/graphql-client';
import { GET_CATEGORIES, GET_PRODUCTS } from '@/lib/queries';
import CircularCategories from '@/components/CircularCategories';
import InfiniteProductGrid from '@/components/InfiniteProductGrid';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Product } from '@/lib/types';
import CategoryTracking from '@/components/CategoryTracking';

export const revalidate = 300; // 5 minutes, consistent with homepage

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
  image?: {
    sourceUrl: string;
    altText: string;
  };
}

interface CategoriesData {
  productCategories: {
    nodes: Category[];
  };
}

interface ProductsData {
  products: {
    nodes: Product[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

async function getCategories() {
  try {
    const data = await graphqlClient.request(GET_CATEGORIES) as CategoriesData;
    return data.productCategories.nodes || [];
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching categories:', error);
    }
    return [];
  }
}

async function getProducts() {
  try {
    const data = await graphqlClient.request(GET_PRODUCTS, { first: 30, after: null }) as ProductsData;
    return {
      products: data.products?.nodes || [],
      pageInfo: data.products?.pageInfo || { hasNextPage: false, endCursor: null }
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching products:', error);
    }
    return {
      products: [],
      pageInfo: { hasNextPage: false, endCursor: null }
    };
  }
}

export default async function CategoriesPage() {
  const [categories, { products, pageInfo }] = await Promise.all([
    getCategories(),
    getProducts()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Facebook Pixel Category Tracking */}
      <CategoryTracking 
        categoryName="All Categories" 
        categoryId="all-categories"
        productCount={products.length}
      />
      
      {/* Categories */}
      <ErrorBoundary>
        <CircularCategories categories={categories} />
      </ErrorBoundary>

      {/* All Products */}
      <ErrorBoundary>
        {products.length > 0 ? (
          <InfiniteProductGrid
            initialProducts={products}
            initialEndCursor={pageInfo.endCursor}
            initialHasNextPage={pageInfo.hasNextPage}
          />
        ) : (
          <section className="py-8 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">Products For You</h2>
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Unable to load products. Please check WooGraphQL plugin installation.</p>
                <p className="text-sm text-gray-400">
                  Make sure &quot;WPGraphQL for WooCommerce&quot; plugin is installed and activated.
                </p>
              </div>
            </div>
          </section>
        )}
      </ErrorBoundary>
    </div>
  );
}
