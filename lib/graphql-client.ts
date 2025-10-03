import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'https://backend.zonash.com/graphql';

if (!process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT && process.env.NODE_ENV === 'development') {
  console.warn('⚠️  NEXT_PUBLIC_GRAPHQL_ENDPOINT not set, using default endpoint');
}

// Create a client for server-side requests (no session)
export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a client for client-side requests with session handling
export const createSessionClient = (sessionToken?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (sessionToken) {
    headers['woocommerce-session'] = `Session ${sessionToken}`;
  }

  return new GraphQLClient(endpoint, { headers });
};

// Helper function to extract session token from response headers
export const extractSessionToken = (response: Response): string | null => {
  const sessionHeader = response.headers.get('woocommerce-session');
  if (sessionHeader) {
    return sessionHeader.replace('Session ', '');
  }
  return null;
};

// Client-side fetch with session token extraction
export async function fetchWithSession(
  query: string,
  variables?: Record<string, unknown>,
  sessionToken?: string
): Promise<{ data: Record<string, unknown>; sessionToken: string | null }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (sessionToken) {
    headers['woocommerce-session'] = `Session ${sessionToken}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(data.errors[0]?.message || 'GraphQL Error');
  }

  // Extract session token from response headers
  const newSessionToken = extractSessionToken(response);

  return {
    data: data.data,
    sessionToken: newSessionToken,
  };
}
