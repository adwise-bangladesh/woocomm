import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import CategoryFiltersWrapper from '@/components/CategoryFiltersWrapper';
import { Product } from '@/lib/types';
import { notFound } from 'next/navigation';
import { validateSlug } from '@/lib/utils/sanitizer';
import { logger } from '@/lib/utils/performance';
import { EnhancedErrorBoundary } from '@/components/EnhancedErrorBoundary';
import { Suspense } from 'react';

// Enhanced ISR with tag-based revalidation
export const revalidate = 300; // 5 minutes ISR

// Generate dynamic tags for selective revalidation
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  return {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Products - Zonash`,
    description: `Browse ${slug} products at Zonash with fast delivery and great prices.`,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

const GET_CATEGORY_INFO = gql`
  query GetCategoryInfo($slug: ID!) {
    productCategory(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      count
    }
  }
`;

const GET_CATEGORY_PRODUCTS = gql`
  query GetCategoryProducts($slug: String!, $first: Int = 30) {
    products(
      first: $first
      where: { 
        category: $slug
        orderby: { field: DATE, order: DESC }
      }
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

async function getCategoryData(slug: string) {
  // Enhanced input validation
  if (!validateSlug(slug)) {
    logger.error('Invalid category slug', { slug });
    return null;
  }

  try {
    logger.debug('Fetching category data from API', { slug });
    
    // Fetch category info and products separately for better reliability
    const [categoryData, productsData] = await Promise.all([
      graphqlClient.request(GET_CATEGORY_INFO, { slug }) as Promise<{
        productCategory: {
          id: string;
          databaseId: number;
          name: string;
          slug: string;
          description?: string;
          count: number;
        } | null;
      }>,
      graphqlClient.request(GET_CATEGORY_PRODUCTS, { slug, first: 30 }) as Promise<{
        products: {
          pageInfo: { endCursor: string | null; hasNextPage: boolean };
          nodes: Product[];
        };
      }>
    ]);
    
    // Validate category exists
    if (!categoryData.productCategory) {
      logger.warn('Category not found in GraphQL response', { slug });
      return null;
    }
    
    logger.debug('Category data loaded successfully', { 
      slug, 
      productsCount: productsData.products?.nodes?.length || 0
    });
    
    return {
      category: categoryData.productCategory,
      products: productsData.products?.nodes || [],
      pageInfo: productsData.products?.pageInfo || { endCursor: null, hasNextPage: false },
    };
  } catch (error) {
    logger.error('Error fetching category data', { 
      slug, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return null;
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Enhanced security: Validate slug and extract client info
  if (!slug || typeof slug !== 'string' || slug.length > 255) {
    logger.warn('Invalid slug detected', { slug });
    notFound();
  }

  const data = await getCategoryData(slug);

  if (!data || typeof data !== 'object' || !('category' in data)) {
    notFound();
  }

  const { products, category, pageInfo } = data as {
    category: {
      id: string;
      databaseId: number;
      name: string;
      slug: string;
      description?: string;
      count: number;
    };
    products: Product[];
    pageInfo: {
      endCursor: string | null;
      hasNextPage: boolean;
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Error Boundary with security and performance features */}
      <EnhancedErrorBoundary 
        onError={(error, errorInfo) => {
          logger.error('Category page error', { 
            slug, 
            error: error.message,
            componentStack: errorInfo.componentStack?.split('\n')[0]
          });
        }}
      >
        <Suspense 
          fallback={
            <div className="px-4 py-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="aspect-square bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <CategoryFiltersWrapper 
            initialProducts={products} 
            categoryName={category.name}
            totalCount={category.count}
            categorySlug={slug}
            categoryDatabaseId={category.databaseId}
            initialEndCursor={pageInfo.endCursor}
            initialHasNextPage={pageInfo.hasNextPage}
          />
        </Suspense>
      </EnhancedErrorBoundary>
    </div>
  );
}
