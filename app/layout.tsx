import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_MENU } from '@/lib/queries';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  path: string;
}

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Zonash Shop - Fast E-commerce',
  description: 'Modern e-commerce powered by WooCommerce and Next.js',
};

async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const data = await graphqlClient.request(GET_MENU, {
      location: 'PRIMARY',
    }) as { menuItems?: { nodes: MenuItem[] } };
    return data.menuItems?.nodes || [];
  } catch (error) {
    console.error('Error fetching menu:', error);
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const menuItems = await getMenuItems();

  return (
    <html lang="en">
      <body className={inter.className}>
        <Header menuItems={menuItems} />
        <main className="pb-16 lg:pb-0">{children}</main>
      </body>
    </html>
  );
}