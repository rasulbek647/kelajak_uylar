import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReklamaPage() {
  let settings = null;
  try {
    settings = await prisma.systemSetting.findUnique({ where: { id: "default" } });
  } catch (e) {
    console.error("DB connection error", e);
  }

  const phone1 = settings?.contactPhone || "+998 90 041 99 95";
  const phone2 = settings?.contactPhone2 || "+998 50 722 09 99";

  return (
    <div className="flex-1 bg-[#1e1f23] flex items-center justify-center p-6 py-20 min-h-[calc(100vh-64px-100px)]">
      <div className="max-w-5xl w-full mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24">
        {/* Chap tomon: Illustration */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative w-full max-w-[450px] aspect-square flex items-center justify-center">
            <svg viewBox="0 0 500 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Oyna/Devor orqa foni */}
              <rect x="100" y="80" width="300" height="200" fill="#2c2d33" rx="10" />
              <rect x="110" y="90" width="130" height="180" fill="#facc15" opacity="0.9" rx="5" />
              <rect x="250" y="90" width="140" height="180" fill="#e5b800" opacity="0.3" rx="5" />
              
              {/* Jalyuzi chiziqlari */}
              {[...Array(12)].map((_, i) => (
                <rect key={`line-${i}`} x="250" y={100 + (i * 14)} width="140" height="4" fill="#1e1f23" />
              ))}

              {/* Kreslo 1 */}
              <path d="M 60 250 Q 80 250 80 320 L 70 320 Z" fill="#facc15" />
              <rect x="65" y="320" width="10" height="50" fill="#333" />
              <path d="M 50 370 H 90" stroke="#facc15" strokeWidth="6" strokeLinecap="round" />

              {/* Kreslo 2 (O'ngda) */}
              <path d="M 440 250 Q 420 250 420 320 L 430 320 Z" fill="#facc15" />
              <rect x="425" y="320" width="10" height="50" fill="#333" />
              <path d="M 410 370 H 450" stroke="#facc15" strokeWidth="6" strokeLinecap="round" />

              {/* Odam 1 (Chap) */}
              <g transform="translate(140, 160)">
                <ellipse cx="40" cy="30" rx="20" ry="25" fill="#facc15" />
                {/* Kostyum */}
                <path d="M 10 70 Q 40 50 70 70 L 60 170 L 20 170 Z" fill="#333" />
                <path d="M 20 170 L 15 250 L 35 250 L 40 170 Z" fill="#222" />
                <path d="M 60 170 L 65 250 L 45 250 L 40 170 Z" fill="#222" />
                {/* Qo'l siqish tomonga */}
                <path d="M 60 80 L 100 120" stroke="#333" strokeWidth="15" strokeLinecap="round" />
                <circle cx="100" cy="120" r="10" fill="#facc15" />
              </g>

              {/* Odam 2 (O'ng) */}
              <g transform="translate(280, 150) scale(-1, 1)">
                <ellipse cx="40" cy="30" rx="20" ry="25" fill="#e5b800" />
                {/* Kostyum */}
                <path d="M 10 70 Q 40 50 70 70 L 60 170 L 20 170 Z" fill="#222" />
                <path d="M 20 170 L 15 250 L 35 250 L 40 170 Z" fill="#111" />
                <path d="M 60 170 L 65 250 L 45 250 L 40 170 Z" fill="#111" />
                {/* Qo'l siqish tomonga */}
                <path d="M 60 80 L 80 130" stroke="#222" strokeWidth="15" strokeLinecap="round" />
                <circle cx="80" cy="130" r="10" fill="#e5b800" />
              </g>

              {/* Stol */}
              <rect x="130" y="320" width="240" height="20" fill="#facc15" rx="5" />
              <rect x="150" y="340" width="200" height="80" fill="#ccc" />
              <rect x="150" y="340" width="200" height="10" fill="#bbb" />
            </svg>
          </div>
        </div>

        {/* O'ng tomon: Tekstlar */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Reklama va hamkorlik</h1>
          <p className="text-gray-300 mb-12 max-w-md leading-relaxed text-lg">
            Ilova va saytda reklama joylashtirish bo'yicha quyidagi raqamlarga murojaat qilishingizni so'raymiz:
          </p>

          <div className="space-y-6">
            <a href={`tel:${phone1.replace(/\s+/g, '')}`} className="flex items-center gap-5 group">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-900">
                  <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-widest">{phone1}</span>
            </a>

            {phone2 && (
              <a href={`tel:${phone2.replace(/\s+/g, '')}`} className="flex items-center gap-5 group">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-900">
                    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-2xl font-bold tracking-widest">{phone2}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

