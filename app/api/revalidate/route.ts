/**
 * Cache Revalidation API Route
 * Handles selective cache invalidation for categories and products
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    // Security: Check authorization header
    const authHeader = req.headers.get('authorization');
    const secretKey = process.env.REVALIDATION_SECRET;
    
    if (!secretKey) {
      console.error('REVALIDATION_SECRET is not set in environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    if (authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, slug, tags } = body;

    // Validate input
    if (!type || typeof type !== 'string') {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 });
    }

    switch (type) {
      case 'category':
        if (!slug || typeof slug !== 'string') {
          return NextResponse.json({ error: 'Category slug is required' }, { status: 400 });
        }
        
        // Revalidate category page and related tags
        await Promise.all([
          revalidatePath(`/category/${slug}`),
          revalidateTag(`category:${slug}`),
          revalidateTag('categories'),
          revalidateTag('products'), // Revalidate all products as they might be in multiple categories
        ]);
        
        console.log(`Revalidated category: ${slug}`);
        break;

      case 'product':
        if (!slug || typeof slug !== 'string') {
          return NextResponse.json({ error: 'Product slug is required' }, { status: 400 });
        }
        
        // Revalidate product page and related tags
        await Promise.all([
          revalidatePath(`/product/${slug}`),
          revalidateTag(`product:${slug}`),
          revalidateTag('products'),
          revalidateTag('homepage'), // Update homepage featured products
        ]);
        
        console.log(`Revalidated product: ${slug}`);
        break;

      case 'tags':
        if (!tags || !Array.isArray(tags)) {
          return NextResponse.json({ error: 'Tags array is required' }, { status: 400 });
        }
        
        // Revalidate multiple tags
        await Promise.all(tags.map(tag => revalidateTag(tag)));
        
        console.log(`Revalidated tags: ${tags.join(', ')}`);
        break;

      case 'all_categories':
        // Revalidate all category pages and homepage
        await Promise.all([
          revalidateTag('categories'),
          revalidateTag('products'),
          revalidatePath('/'),
          revalidatePath('/(subcategories)', 'layout'), // Revalidate layout if needed
        ]);
        
        console.log('Revalidated all categories');
        break;

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });   
    }

    return NextResponse.json({ 
      success: true, 
      message: `${type} cache revalidated successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in revalidation:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'OK',
    service: 'Cache Revalidation API',
    timestamp: new Date().toISOString()
  });
}
