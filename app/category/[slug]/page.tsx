import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import CategoryFiltersWrapper from '@/components/CategoryFiltersWrapper';
import { Product } from '@/lib/types';
import { notFound } from 'next/navigation';

export const revalidate = 300; // 5 minutes, consistent with homepage

const GET_CATEGORY_PRODUCTS = gql`
  query GetCategoryProducts($slug: ID!, $first: Int = 12) {
    productCategory(id: $slug, idType: SLUG) {
      id
      name
      description
      count
      products(first: $first) {
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
  }
`;

async function getCategoryData(slug: string) {
  try {
    console.log('🔍 Fetching category:', slug);
    
    const data = await graphqlClient.request(GET_CATEGORY_PRODUCTS, { slug, first: 24 }) as {
      productCategory: { 
        id: string; 
        name: string; 
        description?: string; 
        count: number;
        products: { nodes: Product[] };
      } | null;
    };
    
    console.log('📊 GraphQL Response:', {
      categoryFound: !!data.productCategory,
      categoryName: data.productCategory?.name,
      productsCount: data.productCategory?.products?.nodes?.length || 0
    });
    
    // If category doesn't exist, return null
    if (!data.productCategory) {
      console.error('❌ Category not found in GraphQL response:', slug);
      return null;
    }
    
    console.log('✅ Category data loaded successfully');
    
    return {
      category: data.productCategory,
      products: data.productCategory.products?.nodes || [],
    };
  } catch (error) {
    console.error('❌ Error fetching category:', slug);
    console.error('Error details:', JSON.stringify(error, null, 2));
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

  const { category, products } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {category.name}
          </h1>
          {category.description && (
            <div
              className="text-gray-600 text-sm md:text-base"
              dangerouslySetInnerHTML={{ __html: category.description }}
            />
          )}
          <p className="text-sm text-gray-500 mt-2">{category.count} products</p>
        </div>
      </div>

      {/* Filters & Sort - Sticky */}
      <CategoryFiltersWrapper initialProducts={products} />
    </div>
  );
}
