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
