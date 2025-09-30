import Link from 'next/link';
import Image from 'next/image';

interface Shop {
  id: string;
  name: string;
  logo: string;
  rating: number;
  followers: string;
}

export default function PopularShops() {
  const shops: Shop[] = [
    {
      id: '1',
      name: 'Vibros Fashion',
      logo: '/shop-logo-1.png',
      rating: 4.8,
      followers: '98 Followers',
    },
    {
      id: '2',
      name: 'Pro Lifestyle',
      logo: '/shop-logo-2.png',
      rating: 4.9,
      followers: '191 Followers',
    },
    {
      id: '3',
      name: 'PORUN BAZAR BD',
      logo: '/shop-logo-3.png',
      rating: 4.8,
      followers: '4 Followers',
    },
  ];

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <h2 className="text-2xl font-bold text-gray-900">Popular Shops</h2>
          </div>
          <Link
            href="/shops"
            className="text-teal-600 hover:text-teal-700 font-semibold text-sm px-4 py-2 border border-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
          >
            See All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <Link
              key={shop.id}
              href={`/shop/${shop.id}`}
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                  {shop.name.charAt(0)}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{shop.name}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="font-semibold">{shop.rating}</span>
                  </div>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">{shop.followers}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
