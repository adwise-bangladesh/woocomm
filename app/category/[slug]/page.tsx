import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import CategoryFiltersWrapper from '@/components/CategoryFiltersWrapper';
import { Product } from '@/lib/types';
import { notFound } from 'next/navigation';
import { validateSlug } from '@/lib/utils/sanitizer';
import { serverLogger } from '@/lib/utils/server-logger';
import { Metadata } from 'next';
import CategoryTracking from '@/components/CategoryTracking';

// ISR Configuration: 5 minutes cache with on-demand revalidation
export const revalidate = 300;

// GraphQL Queries - Optimized for performance
const GET_CATEGORY_AND_PRODUCTS = gql`
  query GetCategoryAndProducts($slug: [String]!, $categorySlug: String!, $first: Int = 30) {
    # Fetch category info
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
    
    # Fetch products filtered by category
    products(
      first: $first
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

// Type definitions
interface CategoryData {
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
}

// Generate SEO-optimized metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  // Validate and sanitize slug for metadata
  const sanitizedSlug = slug.replace(/[^a-z0-9-]/gi, '');
  const categoryName = sanitizedSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return {
    title: `${categoryName} - Shop Best Products | Zonash`,
    description: `Discover amazing ${categoryName.toLowerCase()} products at Zonash. Fast delivery, great prices, and quality guaranteed. Shop now!`,
    openGraph: {
      title: `${categoryName} Products - Zonash`,
      description: `Browse our collection of ${categoryName.toLowerCase()} products with fast delivery and great prices.`,
      type: 'website',
    },
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

// Data fetching function with comprehensive error handling
async function getCategoryData(slug: string): Promise<CategoryData | null> {
  // Security: Validate slug format
  if (!validateSlug(slug)) {
    serverLogger.warn('Invalid category slug format', { slug });
    return null;
  }

  // Security: Additional length check
  if (slug.length > 200) {
    serverLogger.warn('Category slug too long', { slug: slug.substring(0, 50) });
    return null;
  }

  try {
    // Performance: Single parallel GraphQL request for both category and products
    const data = await graphqlClient.request(GET_CATEGORY_AND_PRODUCTS, { 
      slug: [slug],
      categorySlug: slug,
      first: 30
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
      products: {
        pageInfo: { endCursor: string | null; hasNextPage: boolean };
        nodes: Product[];
      };
    };
    
    // Validate category exists
    const category = data.productCategories?.nodes?.[0];
    if (!category) {
      serverLogger.info('Category not found', { slug });
      return null;
    }
    
    // Production logging (only basic info)
    if (process.env.NODE_ENV === 'development') {
      serverLogger.debug('Category data loaded', { 
        slug, 
        productsCount: data.products?.nodes?.length || 0
      });
    }
    
    return {
      category: {
        id: category.id,
        databaseId: category.databaseId,
        name: category.name,
        slug: category.slug,
        description: category.description,
        count: category.count,
      },
      products: data.products?.nodes || [],
      pageInfo: data.products?.pageInfo || { endCursor: null, hasNextPage: false },
    };
  } catch (error) {
    // Security: Don't expose internal error details to client
    serverLogger.error('Error fetching category data', { 
      slug, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return null;
  }
}

// Main page component
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Security: Comprehensive input validation
  if (!slug || typeof slug !== 'string' || slug.length < 1 || slug.length > 200) {
    notFound();
  }

  // Fetch data
  const data = await getCategoryData(slug);

  // Handle not found
  if (!data) {
    notFound();
  }

  const { products, category, pageInfo } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Facebook Pixel Category Tracking */}
      <CategoryTracking 
        categoryName={category.name}
        categoryId={category.databaseId?.toString()}
        categorySlug={slug}
        productCount={category.count}
      />
      
      <CategoryFiltersWrapper 
        initialProducts={products} 
        categoryName={category.name}
        categoryDescription={category.description}
        totalCount={category.count}
        categorySlug={slug}
        initialEndCursor={pageInfo.endCursor}
        initialHasNextPage={pageInfo.hasNextPage}
      />
    </div>
  );
}
