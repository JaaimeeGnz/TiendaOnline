import React, { useState, useEffect } from 'react';

interface BannerSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  background: string;
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=500&fit=crop',
    title: 'ZAPATILLAS DEPORTIVAS',
    subtitle: 'Colección Premium Air Max y Running',
    cta: 'Ver Colección →',
    ctaLink: '/productos?categoria=zapatillas',
    background: 'from-jd-red to-red-700',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=500&fit=crop',
    title: 'ROPA DE ENTRENAMIENTO',
    subtitle: 'Camisetas, Pants y Sudaderas',
    cta: 'Comprar Ahora →',
    ctaLink: '/productos?categoria=ropa',
    background: 'from-jd-black to-gray-900',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&h=500&fit=crop',
    title: 'ACCESORIOS DEPORTIVOS',
    subtitle: 'Mochilas, Gorras y Complementos',
    cta: 'Descubre Más →',
    ctaLink: '/productos?categoria=accesorios',
    background: 'from-jd-turquoise to-teal-700',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=500&fit=crop',
    title: 'REBAJAS HASTA -50%',
    subtitle: 'Los mejores precios en marcas top',
    cta: 'Ver Rebajas →',
    ctaLink: '/productos?rebajas=true',
    background: 'from-orange-600 to-red-700',
  },
];

export default function PromoBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(interval);
  }, [autoPlay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 8000); // Reanudar auto-play después de 8 segundos
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const slide = bannerSlides[currentSlide];

  return (
    <section className="relative h-96 bg-gray-900 overflow-hidden">
      {/* Slider Container */}
      <div className="relative h-full w-full">
        {/* Slides */}
        {bannerSlides.map((s, index) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover"
            />

            {/* Overlay Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${s.background} opacity-40`}
            ></div>

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-start pl-8 md:pl-16">
              <div className="text-white max-w-xl">
                <h1 className="text-5xl md:text-6xl font-black mb-4 uppercase tracking-tighter">
                  {s.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90 font-semibold">
                  {s.subtitle}
                </p>
                <a
                  href={s.ctaLink}
                  className="inline-block px-8 py-4 bg-white text-jd-black font-black text-lg rounded-lg hover:bg-jd-turquoise hover:text-white active:scale-95 transition"
                >
                  {s.cta}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full text-white backdrop-blur-sm transition active:scale-90"
        title="Anterior"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full text-white backdrop-blur-sm transition active:scale-90"
        title="Siguiente"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentSlide
                ? 'w-8 h-2 bg-white'
                : 'w-2 h-2 bg-white bg-opacity-50 hover:bg-opacity-75'
            } rounded-full`}
            title={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto Play Indicator */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 text-white text-sm bg-black bg-opacity-30 px-4 py-2 rounded-full backdrop-blur-sm">
        <div
          className={`w-2 h-2 rounded-full ${autoPlay ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}
        ></div>
        <span>{autoPlay ? 'Automático' : 'Manual'}</span>
      </div>
    </section>
  );
}
