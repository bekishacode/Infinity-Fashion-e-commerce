// src/pages/client/About.tsx

import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Heart, 
  Globe, 
  Shield,
  Award,
  Users,
  Package,
  Palette,
  Printer,
  ShoppingBag
} from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

const About: React.FC = () => {
  const location = useLocation();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Company values
  const values = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We work tirelessly to deliver products that exceed your expectations.',
      color: 'text-magenta',
      bgColor: 'bg-magenta/10'
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: 'Creative Excellence',
      description: 'We push the boundaries of design and printing technology to bring your creative visions to life.',
      color: 'text-orange',
      bgColor: 'bg-orange/10'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Sustainable Fashion',
      description: 'We are committed to eco-friendly materials and sustainable practices for a better fashion future.',
      color: 'text-green',
      bgColor: 'bg-green/10'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Quality Craftsmanship',
      description: 'Every product is made with premium materials and meticulous attention to detail, ensuring lasting quality.',
      color: 'text-royal-blue',
      bgColor: 'bg-royal-blue/10'
    }
  ];

  // Stats
  const stats = [
    { value: '50,000+', label: 'Products Delivered', icon: Package },
    { value: '1,000+', label: 'Happy Businesses', icon: Users },
    { value: '98%', label: 'Satisfaction Rate', icon: Award },
    { value: '5,000+', label: 'Custom Designs', icon: Sparkles }
  ];

  // Team members (placeholder)
  const team = [
    {
      name: 'Tesfaye Tumdedo',
      role: 'Founder & CEO',
      image: '/api/placeholder/150/150',
      bio: 'Passionate about fashion and sustainability'
    },
    {
      name: 'Daniel G/Tsedik',
      role: 'Creative Director',
      image: '/api/placeholder/150/150',
      bio: 'Leading design innovation'
    },
    {
      name: 'Almaz Tesfaye',
      role: 'Operations Manager',
      image: '/api/placeholder/150/150',
      bio: 'Ensuring smooth production'
    },
    {
      name: 'Bereket Fikre',
      role: 'Head of Production',
      image: '/api/placeholder/150/150',
      bio: 'Overseeing quality control'
    }
  ];

  return (
    <div className="min-h-screen bg-white mt-14 md:mt-20">
      {/* Hero Section */}
      <ScrollReveal direction="up">
        <section className="relative bg-gradient-to-br from-royal-blue/5 via-white to-magenta/5 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-royal-blue/10 text-royal-blue px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              About Us
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              We Deliver Style for{' '}
              <span className="bg-gradient-to-r from-magenta to-royal-blue bg-clip-text text-transparent">
                Every Story
              </span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
              We are an Ethiopian local fashion brand engaged in print on demand, 
              fashion garment wholesale, and retailing. We deliver style for every story.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-royal-blue text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Explore Products
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-full font-semibold border-2 border-gray-200 hover:border-royal-blue transition-all duration-300"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Our Story Section */}
      <ScrollReveal direction="up" delay={0.1}>
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                  Our <span className="text-royal-blue">Story</span>
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-magenta to-royal-blue mb-6"></div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Founded in 2024, Style Badge was born from a simple idea: to make custom fashion accessible to everyone. 
                  What started as a small local business has grown into a trusted brand serving customers across Ethiopia.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We believe that fashion is a form of self-expression. Whether you're an individual looking for a unique 
                  piece or a business needing branded merchandise, we're here to bring your vision to life.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our commitment to quality, creativity, and customer satisfaction has earned us the trust of over 1,000 
                  businesses and 5,000+ satisfied customers.
                </p>
              </div>
              <div className="relative">
                <div className="relative bg-gradient-to-br from-royal-blue/10 to-magenta/10 rounded-2xl p-8 border-2 border-royal-blue/20">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🇪🇹</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Made in Ethiopia</h3>
                    <p className="text-gray-600 text-sm">
                      Proudly supporting local artisans and businesses
                    </p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-magenta/20 rounded-full blur-2xl -z-10"></div>
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-royal-blue/20 rounded-full blur-2xl -z-10"></div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Stats Section */}
      <ScrollReveal direction="up" delay={0.15}>
        <section className="bg-gradient-to-r from-royal-blue/5 via-white to-magenta/5 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                By the <span className="text-royal-blue">Numbers</span>
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                The impact we've made since our founding
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-royal-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-royal-blue" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Our Values */}
      <ScrollReveal direction="up" delay={0.2}>
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Our <span className="text-royal-blue">Values</span>
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
                  <div className={`w-14 h-14 ${value.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <span className={value.color}>{value.icon}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Our Services Section */}
      <ScrollReveal direction="up" delay={0.25}>
        <section className="bg-white py-16 md:py-20 border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                What We <span className="text-royal-blue">Offer</span>
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Three ways we serve our customers
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-magenta/5 to-white rounded-2xl p-6 border border-magenta/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-magenta/20 rounded-2xl flex items-center justify-center mb-4">
                  <Printer className="w-7 h-7 text-magenta" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Print on Demand</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Upload your design. We print and ship. No inventory needed. Perfect for creators and small businesses.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">No minimum</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Design upload</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Dropshipping</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-royal-blue/5 to-white rounded-2xl p-6 border border-royal-blue/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-royal-blue/20 rounded-2xl flex items-center justify-center mb-4">
                  <Package className="w-7 h-7 text-royal-blue" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Wholesale</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  50+ pieces minimum. Perfect for businesses, events, and organizations. Custom branding available.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Bulk pricing</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Custom logos</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Samples</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green/5 to-white rounded-2xl p-6 border border-green/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-green/20 rounded-2xl flex items-center justify-center mb-4">
                  <ShoppingBag className="w-7 h-7 text-green" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Retail</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Single item purchases. Latest trends and styles for everyone. Shop unique fashion pieces.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">No minimum</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Fast shipping</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Easy returns</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Team Section (Placeholder) */}
      <ScrollReveal direction="up" delay={0.3}>
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Meet the <span className="text-royal-blue">Team</span>
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                The passionate people behind Style Badge
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <div key={index} className="text-center group">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-royal-blue/10 to-magenta/10 mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <span className="text-5xl font-bold text-royal-blue/30">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800">{member.name}</h3>
                  <p className="text-sm text-royal-blue font-medium">{member.role}</p>
                  <p className="text-xs text-gray-400 mt-1">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* CTA Section */}
      <ScrollReveal direction="up" delay={0.35}>
        <section className="bg-gradient-to-r from-royal-blue/5 via-white to-magenta/5 py-16 md:py-20 border-t border-gray-100">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Ready to <span className="text-royal-blue">Create</span> Something Amazing?
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto mb-6">
              Whether you need a single custom print or a bulk order for your business, we're here to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-royal-blue text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Start Your Project
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-3 rounded-full font-semibold border-2 border-gray-200 hover:border-royal-blue transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
};

export default About;