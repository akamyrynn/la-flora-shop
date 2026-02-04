import Image from 'next/image';

export default function PortfolioPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Портфолио</h1>
      <p className="text-gray-600 mb-8">
        Наши работы доступны только по предзаказу. Свяжитесь с нами для уточнения деталей.
      </p>
      
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Фото {i}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
