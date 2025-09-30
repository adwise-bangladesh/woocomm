import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { notFound } from 'next/navigation';

export const revalidate = 60;

const GET_CATEGORY_PRODUCTS = gql`
  query GetCategoryProducts($slug: ID!, $first: Int = 12) {
    productCategory(id: $slug, idType: SLUG) {
      id
      name
      description
      count
    }
    products(first: $first, where: { category: $slug }) {
      nodes {
        id
        databaseId
        name
        slug
        type
        image {
          sourceUrl
          altText
        }
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
          stockStatus
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
          stockStatus
        }
      }
    }
  }
`;

async function getCategoryData(slug: string) {
  try {
    const data: any = await graphqlClient.request(GET_CATEGORY_PRODUCTS, { slug, first: 24 });
    return {
      category: data.productCategory,
      products: data.products.nodes as Product[],
    };
  } catch (error) {
    console.error('Error fetching category:', error);
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{category.name}</h1>
          {category.description && (
            <div
              className="text-gray-600"
              dangerouslySetInnerHTML={{ __html: category.description }}
            />
          )}
          <p className="text-sm text-gray-500 mt-2">{category.count} products</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
