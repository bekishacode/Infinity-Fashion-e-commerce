import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { apiClient, getImageUrl } from '../../../utils/apiClient';
import { 
  ArrowLeft, 
  Package, 
  Truck,
  Palette,
  Clock,
  Shield,
  CheckCircle,
  Plus,
  Minus,
  Star,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import ScrollReveal from '../../../components/common/ScrollReveal';

// Import from your existing types
import { Category, SubCategory, HowToOrderStep, FAQ, PopularProduct } from '../../../types/api.types';

// Default content if no JSON data exists
const DEFAULT_CONTENT = {
  how_to_order: [
    {
      id: 1,
      icon: 'Palette',
      title: 'Choose Your Style',
      description: 'Browse through our collection and select the style that fits your needs'
    },
    {
      id: 2,
      icon: 'Truck',
      title: 'Select Size & Quantity',
      description: 'Pick your preferred size and quantity. Minimum order quantities may apply'
    },
    {
      id: 3,
      icon: 'CheckCircle',
      title: 'Customize & Review',
      description: 'Add your customizations and review your order details before checkout'
    },
    {
      id: 4,
      icon: 'Shield',
      title: 'Place Order & Track',
      description: 'Complete your purchase and track your order every step of the way'
    }
  ],
  faqs: [
    {
      id: 1,
      question: 'What materials are used for these products?',
      answer: 'All our products are made from premium quality materials. T-shirts use 100% combed cotton, hoodies are made from a cotton-polyester blend, and accessories use durable materials designed for long-lasting wear.'
    },
    {
      id: 2,
      question: 'How long does delivery take?',
      answer: 'Delivery typically takes 3-5 business days for standard shipping. Express shipping options are available for faster delivery. Custom orders may take an additional 2-3 days for production.'
    },
    {
      id: 3,
      question: 'Can I customize the products?',
      answer: 'Yes! We offer various customization options including custom printing, embroidery, and personalized designs. You can choose colors, add logos, or create unique designs for your products.'
    },
    {
      id: 4,
      question: 'What is the minimum order quantity?',
      answer: 'Minimum order quantities vary by product category. For retail products, you can order as few as 1 unit. Wholesale orders typically require a minimum of 10 units per design.'
    }
  ],
  popular_products: [
    {
      id: 1,
      name: 'Classic Cotton T-Shirt',
      price: 450,
      rating: 4.8,
      image: '/api/placeholder/80/80',
      slug: undefined
    },
    {
      id: 2,
      name: 'Premium Hoodie',
      price: 850,
      rating: 4.9,
      image: '/api/placeholder/80/80',
      slug: undefined
    },
    {
      id: 3,
      name: 'Custom Cap',
      price: 350,
      rating: 4.6,
      image: '/api/placeholder/80/80',
      slug: undefined
    }
  ],
  stats: {
    delivery_time: '3-5 Business Days',
    quality_guarantee: '100% Satisfaction',
    customer_rating: '4.8 / 5.0'
  },
  trust_badge: {
    title: 'Trusted by 500+ Customers',
    rating: '4.8/5 average rating'
  }
};

type CardSize = 'normal' | 'large';

interface GridConfig {
  cols: string;
  size: CardSize;
}

const CategoryProducts: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const location = useLocation();
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const getContent = () => ({
    how_to_order: category?.how_to_order?.length ? category.how_to_order : DEFAULT_CONTENT.how_to_order,
    faqs: category?.faqs?.length ? category.faqs : DEFAULT_CONTENT.faqs,
    popular_products: category?.popular_products?.length ? category.popular_products : DEFAULT_CONTENT.popular_products,
    stats: category?.stats ? { ...DEFAULT_CONTENT.stats, ...category.stats } : DEFAULT_CONTENT.stats,
    trust_badge: category?.trust_badge ? { ...DEFAULT_CONTENT.trust_badge, ...category.trust_badge } : DEFAULT_CONTENT.trust_badge
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCategoryData();
  }, [categorySlug, location.search]);

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/categories/detail?slug=${categorySlug}`);
      if (response.success && response.data) {
        const data = response.data as { category: Category; sub_categories: SubCategory[] };
        setCategory(data.category);
        setSubCategories(data.sub_categories || []);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      'Palette': <Palette className="w-6 h-6" />,
      'Truck': <Truck className="w-6 h-6" />,
      'CheckCircle': <CheckCircle className="w-6 h-6" />,
      'Shield': <Shield className="w-6 h-6" />,
      'Package': <Package className="w-6 h-6" />,
      'Clock': <Clock className="w-6 h-6" />,
      'Award': <Award className="w-6 h-6" />,
      'Zap': <Zap className="w-6 h-6" />,
    };
    return icons[iconName] || <Package className="w-6 h-6" />;
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getGridConfig = (): GridConfig => {
    const count = subCategories.length;
    if (count === 0) return { cols: 'grid-cols-1', size: 'normal' };
    if (count === 1) return { cols: 'grid-cols-1', size: 'large' };
    if (count === 2) return { cols: 'grid-cols-1 sm:grid-cols-2', size: 'large' };
    if (count <= 4) return { cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2', size: 'normal' };
    return { cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', size: 'normal' };
  };

  const gridConfig = getGridConfig();
  const content = category ? getContent() : DEFAULT_CONTENT;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-royal-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-body text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="heading-lg text-gray-800">Category not found</h2>
          <Link to="/products" className="text-royal-blue mt-4 inline-block hover:underline">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Section 1: Hero Header */}
      <ScrollReveal direction="up">
        <section className="py-2 md:py-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-24">
            <div className="text-center">
              <h1 className="heading-xl text-orange mb-2">
                {category.display_name}
              </h1>
              <p className="text-body text-gray-500 max-w-2xl mx-auto">
                {category.description || 'Explore our collection of premium custom printed products'}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mt-3">
              <span className="bg-royal-blue px-3 py-1 rounded-full text-xs text-white shadow-sm">
                {subCategories.length} Sub-Categories
              </span>
              <span className="bg-green px-3 py-1 rounded-full text-xs text-white shadow-sm">
                {subCategories.reduce((acc, sub) => acc + (sub.product_count || 0), 0)} Products
              </span>
            </div>

            <div className="flex justify-start mt-3 pt-2 pb-2 border-b border-orange-100">
              <Link 
                to="/products" 
                className="inline-flex items-center gap-2 font-semibold text-gray-500 hover:text-royal-blue text-sm transition group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Categories
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Section 2: About This Category - Full Width */}
      <ScrollReveal direction="up">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="heading-sm text-royal-blue-dark mb-2 flex items-center gap-2">
                  <span className="w-1 h-6 bg-royal-blue rounded-full"></span>
                  About {category.display_name}
                </h3>
                <p className="text-body text-gray-600 leading-relaxed max-w-3xl">
                  {category.description || 'Discover our premium collection of custom printed products designed for quality and style.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 flex-shrink-0">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                  <Package className="w-4 h-4 text-green" />
                  <span className="text-sm font-medium text-gray-700">
                    {subCategories.reduce((acc, sub) => acc + (sub.product_count || 0), 0)} Products
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                  <Clock className="w-4 h-4 text-orange" />
                  <span className="text-sm font-medium text-gray-700">{content.stats.delivery_time}</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                  <Shield className="w-4 h-4 text-royal-blue" />
                  <span className="text-sm font-medium text-gray-700">{content.stats.quality_guarantee}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Section 3: Sub-Categories Grid + How to Order (Side by side) */}
      <ScrollReveal direction="up">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="heading-md text-royal-blue">
              Explore {category.display_name}
            </h2>
            <p className="text-body-sm text-gray-500 mt-1">
              Showing {subCategories.length} sub-categories
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column - Sub Categories Grid (3/4) */}
            <div className="lg:col-span-3">
              {subCategories.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="heading-md text-gray-900">No sub-categories found</h3>
                  <p className="text-body text-gray-500 mt-2">Check back soon for new products</p>
                </div>
              ) : (
                <div className={`grid ${gridConfig.cols} gap-5 md:gap-6`}>
                  {subCategories.map((subCategory) => (
                    <SubCategoryCard 
                      key={subCategory.id} 
                      subCategory={subCategory} 
                      categorySlug={category.slug}
                      size={gridConfig.size}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - How to Order (1/4) - Same level as subcategories */}
            <aside className="lg:col-span-1">
              {content.how_to_order && content.how_to_order.length > 0 && (
                <div className=" p-5 sticky top-24">
                  <h3 className="heading-sm text-green mb-4 flex items-center justify-center gap-2">
                    <Truck className="w-5 h-5" />
                    How to Order
                  </h3>
                  <div className="space-y-3">
                    {content.how_to_order.map((step, index) => (
                      <div 
                        key={step.id} 
                        className="bg-gray-50 rounded-lg p-3 shadow-md border border-gray-100 hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-royal-blue text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-royal-blue">
                                {getIcon(step.icon)}
                              </span>
                              <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>
      </ScrollReveal>

      {/* Section 4: Popular Products - Smaller cards */}
      {content.popular_products && content.popular_products.length > 0 && (
        <section className="bg-gray-50 py-12 border-y border-gray-100 mt-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <div className="mb-8">
                <h2 className="heading-lg text-royal-blue-dark mb-1 flex items-center justify-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  Popular Products
                </h2>
                <p className="text-body-sm text-gray-500 flex items-center justify-center">Most loved items in this category</p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {content.popular_products.map((product) => {
                const hasSlug = product.slug && product.slug.trim() !== '';
                
                return (
                  <ScrollReveal key={product.id} direction="up" delay={0.1}>
                    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group h-full border border-gray-100">
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={getImageUrl(product.image) || '/api/placeholder/400/400'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-1 right-1 bg-yellow-400/90 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium">
                          ★ {product.rating}
                        </div>
                      </div>
                      <div className="p-2.5">
                        {hasSlug ? (
                          <Link 
                            to={`/products/product/${product.slug}`}
                            className="block"
                          >
                            <h4 className="font-medium text-gray-800 text-xs mb-0.5 line-clamp-1 hover:text-royal-blue transition">
                              {product.name}
                            </h4>
                          </Link>
                        ) : (
                          <h4 className="font-medium text-gray-800 text-xs mb-0.5 line-clamp-1">
                            {product.name}
                          </h4>
                        )}
                        <div className="flex items-center gap-0.5 mb-1">
                          {renderStars(product.rating)}
                          <span className="text-[9px] text-gray-500">({product.rating})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-royal-blue">
                            ETB {product.price.toLocaleString()}
                          </p>
                          {hasSlug ? (
                            <Link
                              to={`/products/product/${product.slug}`}
                              className="text-[10px] bg-royal-blue text-white px-2 py-0.5 rounded hover:bg-royal-blue-dark transition"
                            >
                              View
                            </Link>
                          ) : (
                            <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded">
                              View
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Section 5: FAQs */}
      {content.faqs && content.faqs.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="heading-lg text-royal-blue-dark mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-body text-gray-500">
                Find answers to common questions about {category.display_name}
              </p>
            </div>

            <div className="space-y-3">
              {content.faqs.map((faq) => (
                <div 
                  key={faq.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="heading-sm text-gray-600 pr-4">
                      {faq.question}
                    </span>
                    <span className="flex-shrink-0">
                      {expandedFaq === faq.id ? (
                        <Minus className="w-5 h-5 text-royal-blue" />
                      ) : (
                        <Plus className="w-5 h-5 text-royal-blue" />
                      )}
                    </span>
                  </button>
                  
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedFaq === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-4 pb-4 text-body-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const SubCategoryCard: React.FC<{ 
  subCategory: SubCategory; 
  categorySlug: string;
  size: CardSize;
}> = ({ subCategory, categorySlug, size }) => {
  const isLarge = size === 'large';
  
  return (
    <Link 
      to={`/products/category/${categorySlug}/${subCategory.slug}`} 
      className="block group"
    >
      <div className={`bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full ${isLarge ? 'max-w-2xl mx-auto' : ''}`}>
        <div className={`p-3 pb-1 ${isLarge ? 'md:p-5' : ''}`}>
          <div className={`relative overflow-hidden bg-gray-100 rounded-lg ${
            isLarge 
              ? 'aspect-[4/3] md:aspect-[3/2]' 
              : 'aspect-[1/1]'
          }`}>
            <img
              src={getImageUrl(subCategory.image_url) || '/api/placeholder/400/400'}
              alt={subCategory.display_name}
              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/api/placeholder/400/400';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-lg" />
            
            <div className="absolute bottom-3 right-3 bg-green/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
              {subCategory.product_count || 0} {subCategory.product_count === 1 ? 'product' : 'products'}
            </div>
          </div>
        </div>
        
        <div className={`p-3 pt-1 ${isLarge ? 'md:p-5 md:pt-3' : ''}`}>
          <h3 className={`heading-sm text-orange ${isLarge ? 'text-lg md:text-xl' : ''} mb-1 line-clamp-1 group-hover:text-orange/80 transition`}>
            {subCategory.display_name}
          </h3>
          <p className={`${isLarge ? 'text-body' : 'text-body-sm'} text-royal-blue line-clamp-2 leading-relaxed`}>
            {subCategory.description || 'Discover our collection'}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryProducts;