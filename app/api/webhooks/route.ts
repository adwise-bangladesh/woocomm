/**
 * WordPress/WooCommerce Webhook Handler
 * Automatically invalidates cache when products or categories are updated
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    // Security: Verify webhook signature (if configured)
    const signature = req.headers.get('x-webhook-signature');
    const webhookSecret = process.env.WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      // TODO: Implement proper signature verification
      // For now, we'll rely on HTTPS and environment security
    }

    const body = await req.json();
    const { action, resource, slug, id, type } = body;

    console.log('Webhook received:', { action, resource, slug, id, type });

    // Handle different webhook events
    switch (resource) {
      case 'product':
        await handleProductWebhook(action, slug, id);
        break;
        
      case 'category':
        await handleCategoryWebhook(action, slug, id);
        break;
        
      case 'order':
        // Orders don't typically affect cache, but we could invalidate user-specific data
        break;
        
      default:
        console.log('Unknown webhook resource:', resource);
        return NextResponse.json({ error: 'Unknown resource' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Cache invalidated for ${action} ${resource}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleProductWebhook(action: string, slug: string, id: string) {
  switch (action) {
    case 'created':
    case 'updated':
    case 'deleted':
      await Promise.all([
        revalidatePath(`/product/${slug}`),
        revalidateTag(`product:${slug}`),
        revalidateTag(`product:${id}`),
        revalidateTag('products'),
        revalidatePath('/'), // Update homepage featured products
      ]);
      
      console.log(`Product ${action}: ${slug} (${id})`);
      break;
  }
}

async function handleCategoryWebhook(action: string, slug: string, id: string) {
  switch (action) {
    case 'created':
    case 'updated':
    case 'deleted':
      await Promise.all([
        revalidatePath(`/category/${slug}`),
        revalidateTag(`category:${slug}`),
        revalidateTag(`category:${id}`),
        revalidateTag('categories'),
        revalidateTag('products'), // Categories affect product listings
        revalidatePath('/'), // Update homepage category sections
      ]);
      
      console.log(`Category ${action}: ${slug} (${id})`);
      break;
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ 
    status: 'OK',
    service: 'Webhook Handler',
    timestamp: new Date().toISOString()
  });
}
