import { graphqlClient } from '@/lib/graphql-client';
import { GET_PRODUCTS, GET_CATEGORIES, GET_SLIDER_IMAGES } from '@/lib/queries';
import HeroSlider from '@/components/HeroSlider';
import QuickLinks from '@/components/QuickLinks';
import CircularCategories from '@/components/CircularCategories';
import InfiniteProductGrid from '@/components/InfiniteProductGrid';
import { Product } from '@/lib/types';

interface ProductsResponse {
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

export const revalidate = 60; // ISR: Revalidate every 60 seconds

async function getHomePageData() {
  try {
    // Fetch data separately to better handle errors
    const categoriesData = await graphqlClient.request(GET_CATEGORIES).catch(() => ({ 
      productCategories: { nodes: [] } 
    })) as CategoriesResponse;
    
    const sliderData = await graphqlClient.request(GET_SLIDER_IMAGES).catch(() => ({ 
      sliders: { nodes: [] } 
    })) as SliderResponse;
    
    let productsData: any;
    try {
      productsData = await graphqlClient.request(GET_PRODUCTS, { first: 24, after: null });
    } catch (error) {
      console.error('Error fetching products - full error:', JSON.stringify(error, null, 2));
      productsData = {
        products: {
          nodes: [],
          pageInfo: { hasNextPage: false, endCursor: null }
        }
      };
    }

    return {
      products: productsData.products?.nodes || [],
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
      {/* Hero Slider */}
      <section className="container mx-auto px-4 py-4 md:py-6">
        <HeroSlider images={sliderImages} />
      </section>

      {/* Quick Links */}
      <QuickLinks />

      {/* Circular Categories */}
      <CircularCategories categories={categories} />

      {/* All Products */}
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
                Make sure "WPGraphQL for WooCommerce" plugin is installed and activated.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}