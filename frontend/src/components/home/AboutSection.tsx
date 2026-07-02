import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Star, 
  Sparkles, 
  Heart, 
  Globe, 
  Shield,
  Award,
  TrendingUp,
  Users,
  Package,
  Clock,
  Zap
} from 'lucide-react';

// ============================================
// COMPANY VALUES / STATS
// ============================================
const companyStats = [
  { 
    id: 1,
    value: '50,000+', 
    label: 'Products Delivered',
    icon: Package,
    color: 'text-royal-blue',
    bgColor: 'bg-royal-blue/10',
  },
  { 
    id: 2,
    value: '1,000+', 
    label: 'Happy Businesses',
    icon: Users,
    color: 'text-orange',
    bgColor: 'bg-orange/10',
  },
  { 
    id: 3,
    value: '98%', 
    label: 'Satisfaction Rate',
    icon: Award,
    color: 'text-green',
    bgColor: 'bg-green/10',
  },
  { 
    id: 4,
    value: '5,000+', 
    label: 'Custom Designs',
    icon: Sparkles,
    color: 'text-magenta',
    bgColor: 'bg-magenta/10',
  },
];

// ============================================
// COMPANY VALUES / PILLARS
// ============================================
const values = [
  {
    id: 1,
    title: 'Quality Craftsmanship',
    description: 'Every product is made with premium materials and meticulous attention to detail, ensuring lasting quality.',
    icon: Shield,
    color: 'text-royal-blue',
    bgColor: 'bg-royal-blue/10',
  },
  {
    id: 2,
    title: 'Customer First',
    description: 'Your satisfaction is our priority. We work tirelessly to deliver products that exceed your expectations.',
    icon: Heart,
    color: 'text-magenta',
    bgColor: 'bg-magenta/10',
  },
  {
    id: 3,
    title: 'Sustainable Fashion',
    description: 'We are committed to eco-friendly materials and sustainable practices for a better fashion future.',
    icon: Globe,
    color: 'text-green',
    bgColor: 'bg-green/10',
  },
  {
    id: 4,
    title: 'Innovation & Creativity',
    description: 'We push the boundaries of design and printing technology to bring your creative visions to life.',
    icon: Zap,
    color: 'text-orange',
    bgColor: 'bg-orange/10',
  },
];

// ============================================
// ABOUT US SECTION - NO ScrollReveal
// ============================================
interface AboutSectionProps {
  brandDescription: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ brandDescription }) => {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24 bg-white overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-royal-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-magenta/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ============================================ */}
        {/* HEADER - STORY TEXT */}
        {/* ============================================ */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 bg-royal-blue/10 text-royal-blue px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Our Story
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal mb-4">
            We Deliver Style for{' '}
            <span className="bg-gradient-to-r from-magenta to-royal-blue bg-clip-text text-transparent">
              Every Story
            </span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            {brandDescription}
          </p>
        </div>

        {/* ============================================ */}
        {/* STATS GRID - 4 STATS */}
        {/* ============================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20">
          {companyStats.map((stat) => (
            <div
              key={stat.id}
              className="group bg-gray-50 rounded-2xl p-5 sm:p-6 text-center hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-charcoal">{stat.value}</p>
              <p className="text-gray-500 text-xs sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ============================================ */}
        {/* VALUES / PILLARS GRID - 4 VALUES */}
        {/* ============================================ */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20">
          {values.map((value) => (
            <div
              key={value.id}
              className="group bg-gray-50 rounded-2xl p-6 sm:p-7 hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              <div className={`w-12 h-12 ${value.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <value.icon className={`w-6 h-6 ${value.color}`} />
              </div>
              <h3 className="text-lg font-bold text-charcoal mb-2">{value.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>

        {/* ============================================ */}
        {/* CTA BANNER */}
        {/* ============================================ */}
        <div className="mt-12 sm:mt-16 md:mt-20 bg-gradient-to-r from-royal-blue/5 via-magenta/5 to-orange/5 rounded-3xl p-6 sm:p-8 md:p-12 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-charcoal mb-2">
                Ready to Bring Your Ideas to Life?
              </h3>
              <p className="text-gray-600 text-sm sm:text-base max-w-lg">
                Whether you need a single custom print or a bulk order for your business, we're here to help.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-charcoal text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
              >
                Start Your Project
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white text-charcoal px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold border-2 border-gray-200 hover:border-royal-blue transition-all duration-300 text-sm sm:text-base"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* TRUST INDICATORS */}
        {/* ============================================ */}
        <div className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-royal-blue" />
            <span className="text-sm">100% Quality Guarantee</span>
          </div>
          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange" />
            <span className="text-sm">Fast Delivery</span>
          </div>
          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green" />
            <span className="text-sm">Trusted by 1000+ Businesses</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;