import { graphqlClient } from '@/lib/graphql-client';
import { GET_PRODUCTS, GET_CATEGORIES, GET_SLIDER_IMAGES } from '@/lib/queries';
import HeroSlider from '@/components/HeroSlider';
import QuickLinks from '@/components/QuickLinks';
import CircularCategories from '@/components/CircularCategories';
import InfiniteProductGrid from '@/components/InfiniteProductGrid';
import { Product } from '@/lib/types';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

async function getHomePageData() {
  try {
    const [productsData, categoriesData, sliderData]: any = await Promise.all([
      graphqlClient.request(GET_PRODUCTS, { first: 24 }),
      graphqlClient.request(GET_CATEGORIES),
      graphqlClient.request(GET_SLIDER_IMAGES).catch(() => ({ sliders: { nodes: [] } })),
    ]);

    return {
      products: productsData.products.nodes as Product[],
      pageInfo: productsData.products.pageInfo,
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
      <InfiniteProductGrid
        initialProducts={products}
        initialEndCursor={pageInfo.endCursor}
        initialHasNextPage={pageInfo.hasNextPage}
      />
    </div>
  );
}