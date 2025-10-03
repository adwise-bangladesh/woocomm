import { graphqlClient } from '@/lib/graphql-client';
import { GET_PRODUCTS, GET_CATEGORIES, GET_SLIDER_IMAGES } from '@/lib/queries';
import HeroSlider from '@/components/HeroSlider';
import QuickLinks from '@/components/QuickLinks';
import CircularCategories from '@/components/CircularCategories';
import InfiniteProductGrid from '@/components/InfiniteProductGrid';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import StructuredData from '@/components/StructuredData';
import { Product } from '@/lib/types';

interface ProductsData {
  products: {
    nodes: Product[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

interface CategoriesResponse {
  productCategories: { nodes: never[] };
}

interface SliderResponse {
  sliders?: { nodes: never[] };
}

export const revalidate = 300; // ISR: Revalidate every 5 minutes (optimized for e-commerce)

async function getHomePageData() {
  try {
    // Fetch all data in parallel for better performance
    const [categoriesData, sliderData, productsData] = await Promise.all([
      graphqlClient.request(GET_CATEGORIES).catch(() => ({ 
        productCategories: { nodes: [] } 
      })) as Promise<CategoriesResponse>,
      
      graphqlClient.request(GET_SLIDER_IMAGES).catch(() => ({ 
        sliders: { nodes: [] } 
      })) as Promise<SliderResponse>,
      
      graphqlClient.request(GET_PRODUCTS, { first: 30, after: null }).catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching products:', error);
        }
        return {
          products: {
            nodes: [],
            pageInfo: { hasNextPage: false, endCursor: null }
          }
        };
      }) as Promise<ProductsData>,
    ]);

    // Get all products and sort efficiently
    const allProducts = productsData.products?.nodes || [];
    
    // Simple sorting: featured products first, then rest (O(n))
    const sortedProducts = [
      ...allProducts.filter(p => p.featured),
      ...allProducts.filter(p => !p.featured),
    ];

    return {
      products: sortedProducts,
      pageInfo: productsData.products?.pageInfo || { hasNextPage: false, endCursor: null },
      categories: categoriesData.productCategories.nodes || [],
      sliderImages: sliderData.sliders?.nodes || [],
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      products: [],
      pageInfo: { hasNextPage: false, endCursor: null },
      categories: [],
      sliderImages: [],
    };
  }
}

export default async function HomePage() {
  const { products, pageInfo, categories, sliderImages } = await getHomePageData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Structured Data */}
      <StructuredData products={products} type="homepage" />
      
      {/* Hero Slider */}
      <ErrorBoundary>
        <section className="container mx-auto px-4 py-4 md:py-6">
          <HeroSlider images={sliderImages} />
        </section>
      </ErrorBoundary>

      {/* Quick Links */}
      <ErrorBoundary>
        <QuickLinks />
      </ErrorBoundary>

      {/* Circular Categories */}
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