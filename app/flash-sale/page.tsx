import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import { Product } from '@/lib/types';
import FlashSaleClient from './FlashSaleClient';

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
      products(first: 100, where: { onSale: true }) {
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
        products: {
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string | null;
          };
          nodes: Product[];
        };
      } | null;
    };

    if (!data.productCategory) {
      return {
        category: null,
        products: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      };
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
      products: data.productCategory.products?.nodes || [],
      pageInfo: data.productCategory.products?.pageInfo || { hasNextPage: false, endCursor: null },
    };
  } catch (error) {
    console.error('Error fetching flash sale data:', error);
    return {
      category: null,
      products: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }
}

export default async function FlashSalePage() {
  const { category, products, pageInfo } = await getFlashSaleData();

  return (
    <FlashSaleClient
      category={category}
      initialProducts={products}
      initialPageInfo={pageInfo}
    />
  );
}

