import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import CategoryFiltersWrapper from '@/components/CategoryFiltersWrapper';
import { Product } from '@/lib/types';
import { notFound } from 'next/navigation';
import { validateSlug } from '@/lib/utils/sanitizer';
import { logger } from '@/lib/utils/performance';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Suspense } from 'react';

export const revalidate = 300; // 5 minutes, consistent with homepag

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
  // Validate input
  if (!validateSlug(slug)) {
    logger.error('Invalid category slug', { slug });
    return null;
  }

  try {
    logger.debug('Fetching category data', { slug });
    
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
    
    logger.debug('GraphQL Response', {
      categoryFound: !!categoryData.productCategory,
      categoryName: categoryData.productCategory?.name,
      productsCount: productsData.products?.nodes?.length || 0
    });
    
    // If category doesn't exist, return null
    if (!categoryData.productCategory) {
      logger.warn('Category not found in GraphQL response', { slug });
      return null;
    }
    
    logger.debug('Category data loaded successfully');
    
    return {
      category: categoryData.productCategory,
      products: productsData.products?.nodes || [],
      pageInfo: productsData.products?.pageInfo || { endCursor: null, hasNextPage: false },
    };
  } catch (error) {
    logger.error('Error fetching category', { slug, error });
    return null;
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data || !data.category) {
    notFound();
  }

  const { products, category, pageInfo } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filters & Sort - Sticky under header */}
      <ErrorBoundary>
        <Suspense fallback={<div className="px-4 py-6">Loading...</div>}>
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
      </ErrorBoundary>
    </div>
  );
}
