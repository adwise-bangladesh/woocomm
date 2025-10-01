import { graphqlClient } from '@/lib/graphql-client';
import { GET_PRODUCT_BY_SLUG, GET_PRODUCTS } from '@/lib/queries';
import { Product } from '@/lib/types';
import ProductPageClient from '@/components/ProductPageClient';
import InfiniteProductGrid from '@/components/InfiniteProductGrid';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { sanitizeHtml, validateSlug, sanitizeText } from '@/lib/utils/sanitizer';
import { logger } from '@/lib/utils/performance';

export const revalidate = 300; // ISR: Revalidate every 5 minutes

async function getProduct(slug: string) {
  // Validate input
  if (!validateSlug(slug)) {
    return null;
  }

  try {
    const data = await graphqlClient.request(GET_PRODUCT_BY_SLUG, { slug }) as { product: Product };
    
    // Sanitize product data
    if (data.product) {
      data.product.description = sanitizeHtml(data.product.description);
      data.product.shortDescription = sanitizeHtml(data.product.shortDescription);
    }
    
    return data.product as Product;
  } catch (err) {
    logger.error('Error fetching product', err);
    return null;
  }
}

async function getRelatedProducts() {
  try {
    const data = await graphqlClient.request(GET_PRODUCTS, { first: 20, after: null }) as {
      products: {
        nodes: Product[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    };
    return {
      products: data.products?.nodes || [],
      pageInfo: data.products?.pageInfo || { hasNextPage: false, endCursor: null },
    };
  } catch {
    return {
      products: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  if (!validateSlug(slug)) {
    return {
      title: 'Product Not Found',
    };
  }

  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const price = product.salePrice || product.price || product.regularPrice;
  const description = product.shortDescription 
    ? sanitizeText(product.shortDescription).substring(0, 160)
    : `Buy ${product.name} at the best price in Bangladesh`;

  return {
    title: `${product.name} | Zonash`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.image?.sourceUrl ? [product.image.sourceUrl] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: product.image?.sourceUrl ? [product.image.sourceUrl] : [],
    },
    robots: {
      index: product.stockStatus !== 'OUT_OF_STOCK',
      follow: true,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, relatedData] = await Promise.all([
    getProduct(slug),
    getRelatedProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return 'Tk 0';
    const num = parseFloat(price.replace(/[^0-9.-]+/g, ''));
    if (isNaN(num) || num < 0) return 'Tk 0';
    return `Tk ${num.toFixed(0)}`;
  };

  const calculateDiscount = () => {
    if (!product.salePrice || !product.regularPrice) return null;
    const regular = parseFloat(product.regularPrice.replace(/[^0-9.-]+/g, ''));
    const sale = parseFloat(product.salePrice.replace(/[^0-9.-]+/g, ''));
    
    if (isNaN(regular) || isNaN(sale) || regular <= 0 || sale <= 0 || sale >= regular) {
      return null;
    }
    
    const discount = Math.round(((regular - sale) / regular) * 100);
    return discount > 0 && discount < 100 ? discount : null;
  };

  // Allow orders for IN_STOCK and ON_BACKORDER products
  const isInStock = product.stockStatus === 'IN_STOCK';
  const isBackordersAllowed = product.stockStatus === 'ON_BACKORDER';
  const canOrder = isInStock || isBackordersAllowed;
  const discount = calculateDiscount();

  // Generate random review stats
  const generateReviewStats = () => {
    const productIdHash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = parseFloat((4.2 + ((productIdHash % 80) / 100)).toFixed(1));
    const count = 700 + (productIdHash % 1800);
    return { rating, count };
  };

  const reviewStats = generateReviewStats();

  // JSON-LD Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image?.sourceUrl || '/placeholder.png',
    description: sanitizeText(product.shortDescription) || product.name,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      price: parseFloat((product.salePrice || product.price || product.regularPrice || '0').replace(/[^0-9.-]+/g, '')),
      priceCurrency: 'BDT',
      availability: isInStock 
        ? 'https://schema.org/InStock' 
        : isBackordersAllowed 
        ? 'https://schema.org/PreOrder'
        : 'https://schema.org/OutOfStock',
      url: `https://zonash.com/product/${product.slug}`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: reviewStats.rating.toString(),
      reviewCount: reviewStats.count.toString(),
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gray-50">
        <ProductPageClient
          product={product}
          discount={discount}
          reviewStats={reviewStats}
        />

        {/* Product Description */}
        {product.description && (
          <div className="container mx-auto px-2">
            <div className="mt-4 bg-white rounded-[5px] p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Product Description</h2>
              <div
                className="prose prose-sm max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          </div>
        )}

        {/* Related Products */}
        <div className="mt-6">
          <InfiniteProductGrid
            initialProducts={relatedData.products}
            initialEndCursor={relatedData.pageInfo.endCursor}
            initialHasNextPage={relatedData.pageInfo.hasNextPage}
          />
        </div>
      </div>
    </>
  );
}
