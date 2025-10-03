import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import CategoryFiltersWrapper from '@/components/CategoryFiltersWrapper';
import { Product } from '@/lib/types';
import { notFound } from 'next/navigation';
import { validateSlug } from '@/lib/utils/sanitizer';
import { serverLogger } from '@/lib/utils/server-logger';
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

const GET_CATEGORY = gql`
  query GetCategory($slug: [String]) {
    productCategories(where: { slug: $slug }) {
      nodes {
        id
        databaseId
        name
        slug
        description
        count
      }
    }
  }
`;

const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($categorySlug: String!, $first: Int = 30, $after: String) {
    products(
      first: $first
      after: $after
      where: { category: $categorySlug }
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
    serverLogger.error('Invalid category slug', { slug });
    return null;
  }

  try {
    serverLogger.debug('Fetching category data from API', { slug });
    
    // First, fetch category info
    const categoryData = await graphqlClient.request(GET_CATEGORY, { 
      slug: [slug]
    }) as {
      productCategories: {
        nodes: Array<{
          id: string;
          databaseId: number;
          name: string;
          slug: string;
          description?: string;
          count: number;
        }>;
      };
    };
    
    // Validate category exists
    const category = categoryData.productCategories?.nodes?.[0];
    if (!category) {
      serverLogger.warn('Category not found in GraphQL response', { slug });
      return null;
    }
    
    // Now fetch products filtered by category slug
    const productsData = await graphqlClient.request(GET_PRODUCTS_BY_CATEGORY, {
      categorySlug: slug,
      first: 30
    }) as {
      products: {
        pageInfo: { endCursor: string | null; hasNextPage: boolean };
        nodes: Product[];
      };
    };
    
    serverLogger.debug('Category data loaded successfully', { 
      slug, 
      categoryId: category.databaseId,
      productsCount: productsData.products?.nodes?.length || 0
    });
    
    return {
      category: {
        id: category.id,
        databaseId: category.databaseId,
        name: category.name,
        slug: category.slug,
        description: category.description,
        count: category.count,
      },
      products: productsData.products?.nodes || [],
      pageInfo: productsData.products?.pageInfo || { endCursor: null, hasNextPage: false },
    };
  } catch (error) {
    serverLogger.error('Error fetching category data', { 
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
    serverLogger.warn('Invalid slug detected', { slug });
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
      <EnhancedErrorBoundary>
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
