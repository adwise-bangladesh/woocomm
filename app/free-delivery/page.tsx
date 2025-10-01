import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import { Product } from '@/lib/types';
import FreeDeliveryClient from './FreeDeliveryClient';

export const metadata = {
  title: 'Free Delivery - Shop Now | Zonash',
  description: 'Get free delivery on all products! Shop without worrying about shipping costs.',
};

export const revalidate = 300; // Revalidate every 5 minutes

const GET_FREE_DELIVERY_CATEGORY = gql`
  query GetFreeDeliveryCategory {
    productCategory(id: "free-delivery", idType: SLUG) {
      id
      name
      slug
      description
      count
      image {
        sourceUrl
        altText
      }
      products(first: 100) {
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

async function getFreeDeliveryData() {
  try {
    const data = await graphqlClient.request(GET_FREE_DELIVERY_CATEGORY) as {
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
    console.error('Error fetching free delivery data:', error);
    return {
      category: null,
      products: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }
}

export default async function FreeDeliveryPage() {
  const { category, products, pageInfo } = await getFreeDeliveryData();

  return (
    <FreeDeliveryClient
      category={category}
      initialProducts={products}
      initialPageInfo={pageInfo}
    />
  );
}

