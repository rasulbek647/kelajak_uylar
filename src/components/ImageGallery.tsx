"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images }: { images: { url: string }[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[500px] bg-gray-200 rounded-3xl flex items-center justify-center">
        <span className="text-gray-500">Rasm yo'q</span>
      </div>
    );
  }

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── KATTA RASM ── */}
      <div 
        className="relative w-full h-[260px] sm:h-[340px] md:h-[450px] rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100 dark:bg-[#111113] group cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <img 
          key={currentIndex}
          src={images[currentIndex].url} 
          alt="Listing image" 
          className="w-full h-full object-cover animate-[fade_0.3s_ease-in-out]" 
        />
        
        {/* Chap strelka */}
        {images.length > 1 && (
          <button 
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {/* O'ng strelka */}
        {images.length > 1 && (
          <button 
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}

        {/* Pagination chiziqlari (dots) */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-10" onClick={(e) => e.stopPropagation()}>
            {images.map((_, idx) => (
              <button 
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer hover:bg-white ${currentIndex === idx ? 'w-10 bg-yellow-400' : 'w-6 bg-white/50'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── THUMBNAILS (Kichkina rasmlar) ── */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative shrink-0 snap-start w-20 h-24 md:w-24 md:h-28 rounded-xl overflow-hidden transition-all duration-200 ${
                currentIndex === idx 
                  ? 'ring-2 ring-yellow-400 opacity-100 scale-95' 
                  : 'opacity-70 hover:opacity-100 hover:scale-95'
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Modal - Katta qilib ko'rsatish */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col backdrop-blur-sm">
          <div className="flex justify-between items-center p-6 text-white shrink-0">
            <div className="font-medium text-lg bg-white/10 px-4 py-1.5 rounded-full">{currentIndex + 1} / {images.length}</div>
            <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-3 rounded-full transition bg-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center w-full px-4 md:px-12 pb-10">
            {images.length > 1 && (
              <button onClick={prevImage} className="absolute left-2 md:left-8 text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}
            
            <div className="relative w-full h-full max-w-5xl mx-auto flex items-center justify-center">
              <img 
                key={currentIndex}
                src={images[currentIndex].url} 
                alt="" 
                className="max-w-full max-h-[85vh] object-contain select-none animate-[fade_0.3s_ease-in-out]" 
              />
            </div>

            {images.length > 1 && (
              <button onClick={nextImage} className="absolute right-2 md:right-8 text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
