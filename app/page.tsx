import { graphqlClient } from '@/lib/graphql-client';
import { GET_PRODUCTS, GET_CATEGORIES, GET_SLIDER_IMAGES, GET_POPULAR_PRODUCTS } from '@/lib/queries';
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
    const [categoriesData, sliderData, popularData, productsData] = await Promise.all([
      graphqlClient.request(GET_CATEGORIES).catch(() => ({ 
        productCategories: { nodes: [] } 
      })) as Promise<CategoriesResponse>,
      
      graphqlClient.request(GET_SLIDER_IMAGES).catch(() => ({ 
        sliders: { nodes: [] } 
      })) as Promise<SliderResponse>,
      
      graphqlClient.request(GET_POPULAR_PRODUCTS, { first: 12 }).catch(() => ({ 
        products: { nodes: [] } 
      })) as Promise<{ products: { nodes: Product[] } }>,
      
      graphqlClient.request(GET_PRODUCTS, { first: 24, after: null }).catch((error) => {
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

    // Get all products
    const allProducts = productsData.products?.nodes || [];
    const popularProductsList = popularData.products?.nodes || [];
    
    // Optimized sorting: Use Set for O(1) lookups
    const usedIds = new Set<string>();
    const sortedProducts: Product[] = [];
    
    // 1. Add first 8 as recent
    const recentCount = Math.min(8, allProducts.length);
    for (let i = 0; i < recentCount; i++) {
      sortedProducts.push(allProducts[i]);
      usedIds.add(allProducts[i].id);
    }
    
    // 2. Add featured products (excluding recent)
    for (const product of allProducts) {
      if (product.featured && !usedIds.has(product.id)) {
        sortedProducts.push(product);
        usedIds.add(product.id);
      }
    }
    
    // 3. Add popular products (excluding recent and featured)
    const popularCount = Math.min(12, popularProductsList.length);
    for (let i = 0; i < popularCount; i++) {
      const product = popularProductsList[i];
      if (!usedIds.has(product.id)) {
        sortedProducts.push(product);
        usedIds.add(product.id);
      }
    }
    
    // 4. Add remaining products
    for (const product of allProducts) {
      if (!usedIds.has(product.id)) {
        sortedProducts.push(product);
      }
    }

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