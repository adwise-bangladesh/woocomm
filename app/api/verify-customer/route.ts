import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    
    // Validate phone number
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }
    
    // Call the courier API from server-side (no CORS issues)
    const apiUrl = `https://dash.hoorin.com/api/courier/search.php?apiKey=41730dcec62d82e18a9788&searchTerm=${phone}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Courier API error:', response.status);
      // Return empty summaries if API fails
      return NextResponse.json({
        Summaries: {}
      });
    }
    
    const data = await response.json();
    
    // Return the data to the client
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in verify-customer API:', error);
    // Return empty summaries on error (allows order)
    return NextResponse.json({
      Summaries: {}
    });
  }
}

// Disable caching for this API route
export const dynamic = 'force-dynamic';

