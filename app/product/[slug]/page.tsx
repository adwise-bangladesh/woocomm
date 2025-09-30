import { graphqlClient } from '@/lib/graphql-client';
import { GET_PRODUCT_BY_SLUG } from '@/lib/queries';
import { Product } from '@/lib/types';
import Image from 'next/image';
import AddToCartButton from '@/components/AddToCartButton';
import { notFound } from 'next/navigation';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

async function getProduct(slug: string) {
  try {
    const data = await graphqlClient.request(GET_PRODUCT_BY_SLUG, { slug }) as { product: Product };
    return data.product as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return 'Tk 0';
    const num = parseFloat(price.replace(/[^0-9.-]+/g, ''));
    return `Tk ${num.toFixed(0)}`;
  };

  const isInStock = product.stockStatus === 'IN_STOCK';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={product.image?.sourceUrl || '/placeholder.png'}
                  alt={product.image?.altText || product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              {product.galleryImages && product.galleryImages.nodes.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.galleryImages.nodes.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={image.sourceUrl}
                        alt={image.altText || `${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <div className="mb-6">
                {product.salePrice ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-red-600">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.regularPrice)}
                    </span>
                    <span className="bg-red-500 text-white px-2 py-1 text-sm font-semibold rounded">
                      SALE
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.price || product.regularPrice)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {isInStock ? (
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    In Stock
                  </span>
                ) : (
                  <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <div
                  className="prose prose-sm mb-6 text-gray-600"
                  dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                />
              )}

              {/* Variable Product Attributes */}
              {product.type === 'VARIABLE' && product.variations && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Available Variations:</h3>
                  <div className="space-y-2">
                    {product.variations.nodes.map((variation) => (
                      <div
                        key={variation.id}
                        className="flex items-center justify-between p-3 bg-white rounded border border-gray-200"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{variation.name}</p>
                          <p className="text-sm text-gray-600">
                            {variation.attributes.nodes.map((attr) => attr.value).join(', ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">
                            {formatPrice(variation.price)}
                          </span>
                          <AddToCartButton
                            productId={product.databaseId}
                            variationId={variation.databaseId}
                            disabled={variation.stockStatus !== 'IN_STOCK'}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart for Simple Products */}
              {product.type === 'SIMPLE' && (
                <div className="mb-6">
                  <AddToCartButton productId={product.databaseId} disabled={!isInStock} />
                </div>
              )}

              {/* Full Description */}
              {product.description && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                  <div
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
