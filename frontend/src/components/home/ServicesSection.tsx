import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Printer, 
  Building2, 
  Store,
} from 'lucide-react';

const services = [
  {
    id: 'pod',
    title: 'Print on Demand',
    subtitle: 'Custom Designs',
    icon: Printer,
    iconBg: 'bg-magenta/20',
    iconColor: 'text-magenta',
    description: 'Upload your design. We print and ship. No inventory needed. Perfect for creators and small businesses.',
    gradient: 'from-magenta/20 via-pink-500/10 to-rose-500/5',
    features: ['No minimum order', 'Design upload & preview', 'Dropshipping available', 'Quick turnaround'],
    cta: 'Start Designing',
    ctaLink: '/products',
    bgGradient: 'from-magenta to-pink-600',
  },
  
  {
    id: 'retail',
    title: 'Retail',
    subtitle: 'Individual & Gift Shopping',
    icon: Store,
    iconBg: 'bg-green/20',
    iconColor: 'text-green',
    description: 'Single item purchases. Latest trends and styles for everyone. Shop unique fashion pieces.',
    gradient: 'from-green/20 via-emerald-500/10 to-teal-500/5',
    features: ['No minimum order', 'Fast shipping', 'Easy returns', 'Secure checkout'],
    cta: 'Shop Now',
    ctaLink: '/products',
    bgGradient: 'from-green to-emerald-600',
  },
  {
    id: 'wholesale',
    title: 'Wholesale',
    subtitle: 'Bulk Orders & Corporate',
    icon: Building2,
    iconBg: 'bg-royal-blue/20',
    iconColor: 'text-royal-blue',
    description: '50+ pieces minimum. Perfect for businesses, events, and organizations. Custom branding available.',
    gradient: 'from-royal-blue/20 via-blue-500/10 to-indigo-500/5',
    features: ['Bulk pricing', 'Custom logo printing', 'Samples available', '15-20 days delivery'],
    cta: 'Request Quote',
    ctaLink: '/products',
    bgGradient: 'from-royal-blue to-blue-700',
  },
];

const ServicesSection: React.FC = () => {
  // Animation variants with valid easing
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const serviceItem = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-royal-blue/10 text-royal-blue px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Our Services
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">
            How We{' '}
            <span className="bg-gradient-to-r from-magenta to-royal-blue bg-clip-text text-transparent">
              Serve You
            </span>
          </h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Choose the service that fits your needs — from bulk wholesale to individual custom prints
          </p>
        </motion.div>

        {/* Services */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="space-y-12"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              variants={serviceItem}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12 items-start`}
            >
              {/* Visual Side */}
              <div className="w-full lg:w-1/2">
                <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${service.gradient} min-h-[240px] flex items-center justify-center p-8 border border-gray-100`}>
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                  </div>
                  <div className={`relative z-10 ${service.iconBg} p-6 rounded-3xl backdrop-blur-sm`}>
                    <service.icon className={`w-16 h-16 sm:w-20 sm:h-20 ${service.iconColor}`} />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 justify-center">
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/20">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className="w-full lg:w-1/2 space-y-4">
                <div className={`inline-flex items-center gap-2 ${service.iconBg} px-3 py-1.5 rounded-full text-sm font-semibold ${service.iconColor}`}>
                  <service.icon className="w-4 h-4" />
                  {service.subtitle}
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-bold text-charcoal">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 text-base leading-relaxed">
                  {service.description}
                </p>

                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    to={service.ctaLink}
                    className={`inline-flex items-center gap-2 bg-gradient-to-r ${service.bgGradient} text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm`}
                  >
                    {service.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mt-16 text-center"
        >
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-charcoal text-white px-8 py-3.5 rounded-full font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            Let's Work Together
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default ServicesSection;