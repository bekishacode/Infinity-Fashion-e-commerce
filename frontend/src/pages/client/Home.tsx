import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Star, 
  Truck, 
  Shield, 
  Sparkles,
  ChevronRight,
  Clock,
  Award,
  Package,
  Palette,
  Users,
  ThumbsUp,
  ShoppingBag,
  Printer,
  Store,
  Building2,
  TrendingUp
} from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';
import CountUp from '../../components/common/CountUp';
import HeroSection from '../../components/home/HeroSection';
import AboutSection from '../../components/home/AboutSection';
import ServicesSection from '../../components/home/ServicesSection';

const Home: React.FC = () => {
  const [activeService, setActiveService] = useState('all');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // ============================================
  // Your Brand Description
  // ============================================
  const brandDescription = "We are Ethiopian local fashion brand engaged in a business of print on demand, fashion garment wholesale and retailing. We deliver style for every story.";


  return (
    <div className="w-full overflow-x-hidden mt-10">
      {/* ============================================ */}
      {/* HERO SECTION - Modern & Bold */}
      {/* ============================================ */}
      <ScrollReveal direction="up">
        <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-royal-blue/5 via-white to-magenta/5 overflow-hidden">
          <HeroSection />
        </section>
      </ScrollReveal>

      {/* ============================================ */}
      {/* ABOUT SECTION - Brand Story */}
      {/* ============================================ */}
      <ScrollReveal direction="down">
        <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-royal-blue/5 via-white to-magenta/5 overflow-hidden">
          <AboutSection brandDescription={brandDescription} />
        </section>
      </ScrollReveal>
      {/* ============================================ */}
       {/* 3. SERVICES - How We Serve You (NEW) */}
      <ScrollReveal direction="up">
        <ServicesSection />
      </ScrollReveal>
      
    </div>
  );
};

export default Home;