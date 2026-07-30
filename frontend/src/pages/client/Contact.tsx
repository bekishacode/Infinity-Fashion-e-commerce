// src/pages/client/Contact.tsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Clock,
  MessageSquare,
  User,
  ArrowLeft,
  ExternalLink,
  Navigation
} from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import ScrollReveal from '../../components/common/ScrollReveal';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const Contact: React.FC = () => {
  const location = useLocation();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await apiClient.post('/contact', formData);
      if (response.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(response.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Google Maps embed URL
  const googleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15764.881231473022!2d38.76099845990954!3d8.95183645412733!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b839b2c5804cd%3A0xa7cbefd97e297b46!2sSaris%20Addisu%20Sefer%2C%20Addis%20Ababa!5e0!3m2!1sen!2set!4v1783698858237!5m2!1sen!2set";
  const googleMapsLink = "https://www.google.com/maps/place/Saris+Addisu+Sefer,+Addis+Ababa";

  return (
    <div className="min-h-screen bg-white mt-14 md:mt-20">
      {/* Hero Section with Back Button Inside */}
      <ScrollReveal direction="up">
        <section className="relative bg-gradient-to-br from-royal-blue/5 via-white to-magenta/5 py-12 md:py-16">
          <div className="container mx-auto px-4">
            {/* Back Button - Left Aligned Inside Hero */}
            <div className="flex justify-start mb-6">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-royal-blue transition text-sm group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to About Us
              </Link>
            </div>
            
            {/* Centered Content */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-royal-blue/10 text-royal-blue px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Mail className="w-4 h-4" />
                Get in Touch
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-3">
                Contact <span className="text-royal-blue">Us</span>
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                Have a question or want to start a project? We'd love to hear from you.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-4">
            <ScrollReveal direction="right">
              <a
                href="mailto:contact@stylebadgetex.com"
                className="block bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 bg-royal-blue/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-royal-blue/20 transition-colors">
                      <Mail className="w-6 h-6 text-royal-blue" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">Email Us</h3>
                    <p className="text-sm text-royal-blue hover:underline">contact@stylebadgetex.com</p>
                    <p className="text-xs text-gray-400 mt-1">We respond within 2-4 hours</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-royal-blue transition-colors" />
                </div>
              </a>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.1}>
              <a
                href="tel:+251 941 211 242"
                className="block bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 bg-green/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green/20 transition-colors">
                      <Phone className="w-6 h-6 text-green" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">Call Us</h3>
                    <p className="text-sm text-green-600 hover:underline">+251 941 211 242</p>
                    <p className="text-xs text-gray-400 mt-1">Mon-Sat: 9:00 AM - 6:00 PM</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
              </a>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 bg-orange/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange/20 transition-colors">
                      <MapPin className="w-6 h-6 text-orange" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">Visit Us</h3>
                    <p className="text-sm text-gray-500">Saris Addisu Sefer, Addis Ababa</p>
                    <span className="inline-flex items-center gap-1 text-xs text-royal-blue hover:underline mt-1">
                      <Navigation className="w-3 h-3" />
                      Get Directions
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-orange transition-colors" />
                </div>
              </a>
            </ScrollReveal>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ScrollReveal direction="up">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Send a Message</h2>
                  <p className="text-gray-500 text-sm">
                    Fill in the form below and we'll get back to you as soon as possible.
                  </p>
                </div>

                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 animate-fadeIn">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Thank you! Your message has been sent successfully.</span>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-fadeIn">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4 text-royal-blue" />
                          Full Name
                        </span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-royal-blue focus:border-transparent transition outline-none bg-gray-50 hover:bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-royal-blue" />
                          Email Address
                        </span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-royal-blue focus:border-transparent transition outline-none bg-gray-50 hover:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-royal-blue" />
                          Phone Number
                        </span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+251*********"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-royal-blue focus:border-transparent transition outline-none bg-gray-50 hover:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-royal-blue" />
                          Subject
                        </span>
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-royal-blue focus:border-transparent transition outline-none bg-gray-50 hover:bg-white"
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Product Question">Product Question</option>
                        <option value="Custom Order">Custom Order</option>
                        <option value="Wholesale Request">Wholesale Request</option>
                        <option value="Print on Demand">Print on Demand</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Feedback">Feedback</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-royal-blue" />
                        Message
                      </span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project or inquiry..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-royal-blue focus:border-transparent transition outline-none bg-gray-50 hover:bg-white resize-none"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Minimum 10 characters
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-royal-blue to-magenta text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 group"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Send Message
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400 mt-2">
                    We'll respond to your message within 24 hours.
                    <Clock className="w-3 h-3 inline ml-1" />
                  </p>
                </form>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Google Map - Full Width Below Form */}
        <div className="max-w-6xl mx-auto mt-8">
          <ScrollReveal direction="up" delay={0.2}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange" />
                Find Us on Map
              </h3>
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
              >
                <iframe
                  src={googleMapsEmbedUrl}
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Style Badge Location"
                  className="w-full pointer-events-none"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium text-gray-700 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105">
                    <Navigation className="w-4 h-4 text-royal-blue" />
                    Click to open in Google Maps
                  </div>
                </div>
              </a>
              <div className="mt-3 text-center">
                <a
                  href={googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-royal-blue hover:underline font-medium"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions on Google Maps
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Contact;