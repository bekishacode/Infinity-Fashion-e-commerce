// src/components/home/HeroSection.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../utils/apiClient';
import { HeroSlide } from '../../types/api.types';

const HeroSection: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [imageKey, setImageKey] = useState(Date.now());

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        // Use HeroSlide[] as the type parameter
        const response = await apiClient.get<HeroSlide[]>('/homepage/hero-slides');
        if (response.success && response.data) {
          setSlides(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch hero slides:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setIsAnimating(true);
    setImageKey(Date.now());
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setIsAnimating(false);
    }, 400);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setIsAnimating(true);
    setImageKey(Date.now());
    setTimeout(() => {
      setCurrentSlide(index);
      setIsAnimating(false);
    }, 400);
  };

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(interval);
  }, [nextSlide, slides.length]);

  const handleImageError = (id: number) => {
    console.log(`Image failed to load for slide ${id}`);
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  if (loading) {
    return (
      <div className="relative w-full h-full min-h-[90vh] flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const currentItem = slides[currentSlide];

  return (
    <div className="relative w-full h-full min-h-[90vh] flex flex-col">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentItem.bg_gradient} transition-all duration-700`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex-1 flex items-center w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 md:py-14">
        <div className="w-full grid lg:grid-cols-2 gap-12 md:gap-20 items-center mt-4 sm:mt-0">
          {/* Left Side - Text */}
          <div className={`text-white transition-all duration-500 ${isAnimating ? 'opacity-0 transform translate-x-[-20px]' : 'opacity-100 transform translate-x-0'}`}>
            <div className="inline-block mb-4 px-5 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold animate-fade-in">
              {currentItem.subtitle}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 animate-fade-in leading-tight">
              {currentItem.title}
            </h1>
            <p className="text-white/90 text-base md:text-lg lg:text-xl mb-6 md:mb-8 animate-slide-up leading-relaxed max-w-lg">
              {currentItem.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
              <Link 
                to={currentItem.button_link}
                className="bg-white text-royal-blue px-8 md:px-10 py-3 md:py-3.5 rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105 text-center text-sm md:text-base"
              >
                {currentItem.button_text} →
              </Link>
              <Link 
                to="/products"
                className="border-2 border-white text-white px-8 md:px-10 py-3 md:py-3.5 rounded-lg font-semibold hover:bg-white hover:text-royal-blue transition text-center text-sm md:text-base"
              >
                View All Products
              </Link>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className={`flex items-center justify-center transition-all duration-500 ${isAnimating ? 'opacity-0 transform translate-x-[20px]' : 'opacity-100 transform translate-x-0'}`}>
            {!imageErrors[currentItem.id] ? (
              <div className="w-full flex items-center justify-center">
                <img 
                  key={`${currentItem.id}-${imageKey}`}
                  src={`${currentItem.image}?t=${imageKey}`}
                  alt={currentItem.title}
                  className="w-full max-w-[600px] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[900px] h-auto max-h-[500px] md:max-h-[600px] lg:max-h-[700px] xl:max-h-[750px] object-contain drop-shadow-2xl"
                  style={{ filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))' }}
                  onError={() => handleImageError(currentItem.id)}
                  loading="eager"
                />
              </div>
            ) : (
              <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white/60 text-sm">Product preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="relative w-full pb-6 md:pb-8">
        <div className="flex justify-center space-x-2 md:space-x-3">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(idx)}
              className={`transition-all duration-300 ${
                currentSlide === idx 
                  ? 'w-10 md:w-14 h-2.5 bg-white rounded-full' 
                  : 'w-5 md:w-7 h-2.5 bg-white/40 rounded-full hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;