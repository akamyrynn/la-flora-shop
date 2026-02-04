import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary-700 text-cream py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-serif italic mb-4">La Flora</h3>
            <p className="text-cream/80 text-sm leading-relaxed">
              Элегантные букеты ручной работы с доставкой по городу
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-cream">Каталог</h4>
            <ul className="space-y-2 text-cream/80 text-sm">
              <li><Link href="/catalog?type=mono" className="hover:text-cream transition">Монобукеты</Link></li>
              <li><Link href="/catalog?type=mixed" className="hover:text-cream transition">Сборные букеты</Link></li>
              <li><Link href="/catalog?flower=roses" className="hover:text-cream transition">Розы</Link></li>
              <li><Link href="/catalog?flower=peonies" className="hover:text-cream transition">Пионы</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-cream">Информация</h4>
            <ul className="space-y-2 text-cream/80 text-sm">
              <li><Link href="/portfolio" className="hover:text-cream transition">Портфолио</Link></li>
              <li><Link href="/faq" className="hover:text-cream transition">FAQ</Link></li>
              <li><Link href="/reviews" className="hover:text-cream transition">Отзывы</Link></li>
              <li><Link href="/quiz" className="hover:text-cream transition">Подбор букета</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-cream">Контакты</h4>
            <ul className="space-y-2 text-cream/80 text-sm">
              <li>Телефон: +7 (XXX) XXX-XX-XX</li>
              <li>Email: info@laflora.ru</li>
              <li className="pt-2">
                <a 
                  href="https://t.me/laflora" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-cream transition"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.099.155.232.171.326.016.094.036.308.02.475z"/>
                  </svg>
                  Telegram
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-cream/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-cream/65 text-sm">
          <p>&copy; 2026 La Flora. Все права защищены.</p>
          <div className="flex gap-6">
            <Link href="/terms-and-conditions" className="hover:text-cream transition">Условия</Link>
            <Link href="/refund-policy" className="hover:text-cream transition">Возврат</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
