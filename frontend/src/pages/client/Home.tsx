import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import CountUp from '../../components/common/CountUp';
import HeroSection from '../../components/home/HeroSection';
import AboutSection from '../../components/home/AboutSection';
import ServicesSection from '../../components/home/ServicesSection';

const Home: React.FC = () => {
  const [activeService, setActiveService] = useState('all');
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // Scroll to top on mount and when location changes (navigation to home)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const brandDescription = "We are Ethiopian local fashion brand engaged in a business of print on demand, fashion garment wholesale and retailing. We deliver style for every story.";

  // Variants for section animations - using valid Framer Motion easing
  const sectionVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.7
      }
    }
  };

  return (
    <div className="w-full overflow-x-hidden mt-10">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-royal-blue/5 via-white to-magenta/5 overflow-hidden">
        <HeroSection />
      </section>

      {/* ABOUT SECTION - With Framer Motion */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="relative min-h-[90vh] flex items-center bg-white overflow-hidden"
      >
        <AboutSection brandDescription={brandDescription} />
      </motion.section>

      {/* SERVICES SECTION - With Framer Motion */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <ServicesSection />
      </motion.section>
    </div>
  );
};

export default Home;