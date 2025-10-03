import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import CategoryFiltersWrapper from '@/components/CategoryFiltersWrapper';
import { Product } from '@/lib/types';
import { notFound } from 'next/navigation';
import { validateSlug } from '@/lib/utils/sanitizer';
import { logger } from '@/lib/utils/performance';
import { EnhancedErrorBoundary } from '@/components/EnhancedErrorBoundary';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { categoryCache, warmCategoryCache, warmProductCache, generateCategoryKey } from '@/lib/utils/cache';
import { categoryPageLimiter } from '@/lib/utils/rateLimiter';

// Enhanced ISR with tag-based revalidation
export const revalidate = 300; // 5 minutes ISR
export const dynamicParams = true; // Allow dynamic params

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

async function getCategoryData(slug: string, clientIp?: string) {
  // Enhanced input validation
  if (!validateSlug(slug)) {
    logger.error('Invalid category slug', { slug });
    return null;
  }

  // Rate limiting check
  if (clientIp) {
    const rateLimit = categoryPageLimiter.isAllowed(clientIp);
    if (!rateLimit.allowed) {
      logger.warn('Rate limit exceeded', { ip: clientIp, slug });
      throw new Error('Too many requests. Please try again later.');
    }
  }

  // Check cache first
  const cacheKey = generateCategoryKey(slug, 1);
  const cachedData = categoryCache.get(cacheKey);
  if (cachedData) {
    logger.debug('Cache hit for category', { slug });
    return cachedData;
  }

  try {
    logger.debug('Fetching category data from API', { slug });
    
    // Fetch category info and products with cache tags
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
    
    // Prepare response data
    const responseData = {
      category: categoryData.productCategory,
      products: productsData.products?.nodes || [],
      pageInfo: productsData.products?.pageInfo || { endCursor: null, hasNextPage: false },
    };

    // Cache warming - warm both category and individual products
    await Promise.all([
      warmCategoryCache(slug, responseData),
      warmProductCache(responseData.products)
    ]);

    logger.debug('Category data loaded and cached successfully', { 
      slug, 
      cacheKey,
      productsCached: responseData.products.length 
    });
    
    return responseData;
  } catch (error) {
    logger.error('Error fetching category data', { 
      slug, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Return cached data if available during errors (graceful degradation)
    const fallbackData = categoryCache.get(cacheKey);
    if (fallbackData) {
      logger.info('Using cached fallback data due to error', { slug });
      return fallbackData;
    }
    
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

  // Extract client IP for rate limiting
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const clientIp = forwardedFor?.split(',')[0] || 
                  headersList.get('x-real-ip') || 
                  '127.0.0.1';

  let data;
  try {
    data = await getCategoryData(slug, clientIp);
  } catch (error) {
    // Handle rate limiting or other errors
    if (error instanceof Error && error.message.includes('Too many requests')) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Rate Limited</h2>
            <p className="text-gray-600">Please wait a moment before accessing this page again.</p>
          </div>
        </div>
      );
    }
    throw error;
  }

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
            categoryId={category.id}
            categoryDatabaseId={category.databaseId}
            initialEndCursor={pageInfo.endCursor}
            initialHasNextPage={pageInfo.hasNextPage}
          />
        </Suspense>
      </EnhancedErrorBoundary>
    </div>
  );
}
