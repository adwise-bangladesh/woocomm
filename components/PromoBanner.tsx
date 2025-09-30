import Image from 'next/image';

export default function PromoBanner() {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-r from-teal-700 to-teal-600 rounded-lg overflow-hidden">
          {/* Left Content */}
          <div className="p-8 md:p-12 flex flex-col justify-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Try selling in a store that customers trust
            </h2>
            <p className="text-lg mb-6 text-teal-50">
              using high-impact tools and programs.
            </p>
            <button className="bg-white text-teal-700 px-8 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors w-fit">
              Start Selling
            </button>
          </div>

          {/* Right Image */}
          <div className="relative h-64 md:h-auto">
            <Image
              src="/promo-boxes.jpg"
              alt="Selling tools"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
