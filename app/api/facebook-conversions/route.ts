import { NextRequest, NextResponse } from 'next/server';

// Facebook Conversions API endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, eventData, userData, customData } = body;

    // Get IP address from request
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.ip || 
                     'unknown';

    // Get user agent
    const userAgent = request.headers.get('user-agent') || '';

    // Enhanced user data with server-side data
    const enhancedUserData = {
      ...userData,
      client_ip_address: ipAddress,
      client_user_agent: userAgent,
    };

    // Facebook Conversions API payload
    const conversionsData = {
      data: [{
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        user_data: enhancedUserData,
        custom_data: customData,
        event_source_url: body.eventSourceUrl || 'https://zoansh.com',
        action_source: 'website',
        event_id: body.eventId || `${eventName}_${Date.now()}`,
      }],
      access_token: process.env.FACEBOOK_ACCESS_TOKEN,
      pixel_id: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
    };

    // Send to Facebook Conversions API
    const response = await fetch(`https://graph.facebook.com/v18.0/${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(conversionsData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Facebook Conversions API success:', result);
      return NextResponse.json({ success: true, result });
    } else {
      console.error('Facebook Conversions API error:', result);
      return NextResponse.json({ success: false, error: result }, { status: 400 });
    }
  } catch (error) {
    console.error('Server-side tracking error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
