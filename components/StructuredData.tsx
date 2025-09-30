import { Product } from '@/lib/types';

interface StructuredDataProps {
  products?: Product[];
  type?: 'homepage' | 'product' | 'category';
}

export default function StructuredData({ products, type = 'homepage' }: StructuredDataProps) {
  if (type === 'homepage' && products && products.length > 0) {
    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'itemListElement': products.slice(0, 20).map((product, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Product',
          'name': product.name,
          'url': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zonash.com'}/product/${product.slug}`,
          'image': product.image?.sourceUrl,
          ...(product.price && {
            'offers': {
              '@type': 'Offer',
              'price': product.price.replace(/[^0-9.]/g, ''),
              'priceCurrency': 'BDT',
              'availability': product.stockStatus === 'IN_STOCK' 
                ? 'https://schema.org/InStock' 
                : 'https://schema.org/OutOfStock',
            }
          }),
        }
      }))
    };

    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Zonash',
      'url': process.env.NEXT_PUBLIC_SITE_URL || 'https://zonash.com',
      'logo': 'https://backend.zonash.com/wp-content/uploads/logo.png',
      'sameAs': [
        // Add your social media URLs here
      ]
    };

    const webSiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Zonash',
      'url': process.env.NEXT_PUBLIC_SITE_URL || 'https://zonash.com',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zonash.com'}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </>
    );
  }

  return null;
}

