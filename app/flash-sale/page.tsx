import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import { Product } from '@/lib/types';
import CategoryFiltersWrapper from '@/components/CategoryFiltersWrapper';
import InfiniteProductGrid from '@/components/InfiniteProductGrid';

export const metadata = {
  title: 'Flash Sale - Limited Time Offers | Zonash',
  description: 'Grab amazing deals before time runs out! Flash sale products with limited time offers.',
};

export const revalidate = 300; // Revalidate every 5 minutes

const GET_FLASH_SALE_CATEGORY = gql`
  query GetFlashSaleCategory {
    productCategory(id: "flash-sale", idType: SLUG) {
      id
      name
      slug
      description
      count
      image {
        sourceUrl
        altText
      }
    }
    
    products(
      first: 30
      where: { category: "flash-sale" }
    ) {
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        id
        name
        slug
        image {
          sourceUrl
          altText
        }
        ... on ProductWithPricing {
          price
          regularPrice
          salePrice
        }
        ... on InventoriedProduct {
          stockStatus
        }
      }
    }
  }
`;

const GET_HOMEPAGE_PRODUCTS = gql`
  query GetHomepageProducts($first: Int = 30, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        slug
        image {
          sourceUrl
          altText
        }
        ... on ProductWithPricing {
          price
          regularPrice
          salePrice
        }
        ... on InventoriedProduct {
          stockStatus
        }
      }
    }
  }
`;

async function getFlashSaleData() {
  try {
    const data = await graphqlClient.request(GET_FLASH_SALE_CATEGORY) as {
      productCategory: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        count: number;
        image: {
          sourceUrl: string;
          altText: string | null;
        } | null;
      } | null;
      products: {
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
        nodes: Product[];
      };
    };

    if (!data.productCategory) {
      return {
        category: null,
        products: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Flash sale data fetched:', {
        category: data.productCategory.name,
        productsCount: data.products?.nodes?.length || 0,
        hasProducts: (data.products?.nodes?.length || 0) > 0
      });
    }

    return {
      category: {
        id: data.productCategory.id,
        name: data.productCategory.name,
        slug: data.productCategory.slug,
        description: data.productCategory.description,
        count: data.productCategory.count,
        image: data.productCategory.image,
      },
      products: data.products?.nodes || [],
      pageInfo: data.products?.pageInfo || { hasNextPage: false, endCursor: null },
    };
  } catch (error) {
    console.error('Error fetching flash sale data:', error);
    if (process.env.NODE_ENV === 'development') {
      console.log('Flash sale query failed. Make sure the "flash-sale" category exists in WordPress.');
    }
    return {
      category: null,
      products: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }
}

async function getHomepageProducts() {
  try {
    const data = await graphqlClient.request(GET_HOMEPAGE_PRODUCTS, { first: 30, after: null }) as {
      products: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: Product[];
      };
    };
    return {
      products: data.products?.nodes || [],
      pageInfo: data.products?.pageInfo || { hasNextPage: false, endCursor: null },
    };
  } catch (error) {
    console.error('Error fetching homepage products:', error);
    return {
      products: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }
}

export default async function FlashSalePage() {
  const { category, products, pageInfo } = await getFlashSaleData();
  const { products: homepageProducts, pageInfo: homepagePageInfo } = await getHomepageProducts();

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Flash Sale Category Not Found</h1>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            Please create a product category with slug &quot;flash-sale&quot; in WordPress to enable flash sale products.
          </p>
          <a
            href="/categories"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Browse All Products
          </a>
        </div>
      </div>
    );
  }

  // Show message if no products are available
  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Empty State Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-10">
            <div className="text-center max-w-xl mx-auto">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">No Flash Sale Products</h1>
              <p className="text-sm text-gray-600 mb-6">There are currently no flash sale products available. Check back soon for amazing deals!</p>
            </div>
          </div>
        </div>

        {/* Products for You Section */}
        <div className="container mx-auto py-4">
          {homepageProducts.length > 0 ? (
            <InfiniteProductGrid
              initialProducts={homepageProducts}
              initialEndCursor={homepagePageInfo.endCursor}
              initialHasNextPage={homepagePageInfo.hasNextPage}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500 mb-4">Unable to load products. Please try again later.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
              >
                Refresh Page
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryFiltersWrapper 
        initialProducts={products} 
        categoryName={category.name}
        categoryDescription={category.description || undefined}
        totalCount={category.count}
        categorySlug="flash-sale"
        initialEndCursor={pageInfo.endCursor}
        initialHasNextPage={pageInfo.hasNextPage}
      />
    </div>
  );
}

