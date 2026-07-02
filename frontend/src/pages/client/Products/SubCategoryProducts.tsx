import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiClient, getImageUrl } from '../../../utils/apiClient';
import { 
  ArrowLeft, 
  Package, 
  ShoppingCart, 
  Eye, 
  Sparkles,
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
import StaggerReveal from '../../../components/common/StaggerReveal';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  service_type: string;
  badge: string | null;
  badge_color: string | null;
  rating: number;
  review_count: number;
  primary_image: string | null;
  in_stock: number;
  min_quantity: number;
}

interface SubCategory {
  id: number;
  name: string;
  slug: string;
  display_name: string;
  description: string;
  banner_image: string | null;
  // Dynamic content fields
  how_to_order?: HowToOrderStep[];
  faqs?: FAQ[];
  stats?: SubCategoryStats;
  features?: SubCategoryFeature[];
  trust_badge?: TrustBadge;
}

interface HowToOrderStep {
  id: number;
  icon: string;
  title: string;
  description: string;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface SubCategoryStats {
  delivery_time: string;
  quality_guarantee: string;
  customer_rating: string;
}

interface SubCategoryFeature {
  icon: string;
  title: string;
  description: string;
}

interface TrustBadge {
  title: string;
  rating: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  display_name: string;
}

// Default content if no JSON data exists
const DEFAULT_CONTENT = {
  how_to_order: [
    {
      id: 1,
      icon: 'Palette',
      title: 'Choose Your Style',
      description: 'Browse our collection and select the style that fits your needs'
    },
    {
      id: 2,
      icon: 'Truck',
      title: 'Select Size & Quantity',
      description: 'Pick your preferred size and quantity'
    },
    {
      id: 3,
      icon: 'CheckCircle',
      title: 'Customize & Review',
      description: 'Add your customizations and review your order'
    },
    {
      id: 4,
      icon: 'Shield',
      title: 'Place Order & Track',
      description: 'Complete your purchase and track your order'
    }
  ],
  faqs: [
    {
      id: 1,
      question: 'What materials are used for these products?',
      answer: 'All our products are made from premium quality materials.'
    },
    {
      id: 2,
      question: 'How long does delivery take?',
      answer: 'Delivery typically takes 3-5 business days.'
    },
    {
      id: 3,
      question: 'Can I customize the products?',
      answer: 'Yes! We offer various customization options.'
    },
    {
      id: 4,
      question: 'What is the minimum order quantity?',
      answer: 'Minimum order quantities vary by product.'
    }
  ],
  stats: {
    delivery_time: '3-5 Business Days',
    quality_guarantee: '100% Satisfaction',
    customer_rating: '4.8 / 5.0'
  },
  features: [
    {
      icon: 'Shield',
      title: 'Premium Quality',
      description: 'High-quality materials and printing'
    },
    {
      icon: 'Truck',
      title: 'Fast Delivery',
      description: 'Get your products within 3-5 days'
    },
    {
      icon: 'Sparkles',
      title: 'Custom Options',
      description: 'Personalize your products with custom designs'
    }
  ],
  trust_badge: {
    title: 'Trusted by 500+ Customers',
    rating: '4.8/5 average rating'
  }
};

const SubCategoryProducts: React.FC = () => {
  const { categorySlug, subCategorySlug } = useParams();
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const getContent = () => ({
    how_to_order: subCategory?.how_to_order?.length ? subCategory.how_to_order : DEFAULT_CONTENT.how_to_order,
    faqs: subCategory?.faqs?.length ? subCategory.faqs : DEFAULT_CONTENT.faqs,
    stats: subCategory?.stats ? { ...DEFAULT_CONTENT.stats, ...subCategory.stats } : DEFAULT_CONTENT.stats,
    features: subCategory?.features?.length ? subCategory.features : DEFAULT_CONTENT.features,
    trust_badge: subCategory?.trust_badge ? { ...DEFAULT_CONTENT.trust_badge, ...subCategory.trust_badge } : DEFAULT_CONTENT.trust_badge
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts();
  }, [subCategorySlug, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/products/by-subcategory', {
        slug: subCategorySlug,
        sort: sortBy
      });
      if (response.success && response.data) {
        const data = response.data as { sub_category: SubCategory; category: Category; products: Product[] };
        setSubCategory(data.sub_category);
        setCategory(data.category);
        setProducts(data.products);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
    ));
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
      'Sparkles': <Sparkles className="w-6 h-6" />,
    };
    return icons[iconName] || <Package className="w-6 h-6" />;
  };

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const content = subCategory ? getContent() : DEFAULT_CONTENT;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-royal-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!subCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Category not found</h2>
          <Link to="/products" className="text-royal-blue mt-4 inline-block hover:underline">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white mt-24 mb-8">
      {/* Sub-category Banner */}
      <ScrollReveal direction="up">
        <div className="relative h-36 md:h-46 overflow-hidden">
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
            <div className="container mx-auto px-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-black/80 mb-3">
                <Link to="/products" className="hover:text-royal-blue">Products</Link>
                <span>/</span>
                <Link to={`/products/category/${categorySlug}`} className="hover:text-charcoal">{category?.display_name}</Link>
                <span>/</span>
                <span className="text-charcoal">{subCategory.display_name}</span>
              </div>
              
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-orange mb-2">
                {subCategory.display_name}
              </h1>
              <p className="text-white/80 max-w-2xl mx-auto">
                {subCategory.description}
              </p>
              
              <div className="mt-4 flex justify-center lg:justify-start">
                <Link
                  to={`/products/category/${categorySlug}`}
                  className="inline-flex items-center gap-2 text-black/80 hover:text-black text-sm transition group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to {category?.display_name || 'Categories'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <div className="container mx-auto px-4 py-8">
        {/* Sort Options */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{products.length}</span> products
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-royal-blue"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </ScrollReveal>

        {/* Products Grid */}
        {products.length === 0 ? (
          <ScrollReveal direction="up">
            <div className="text-center py-12 bg-white rounded-xl">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No products found</h3>
              <p className="text-gray-500 mt-2">Check back soon for new arrivals</p>
            </div>
          </ScrollReveal>
        ) : (
          <StaggerReveal 
            direction="up" 
            staggerDelay={0.08}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} renderStars={renderStars} />
            ))}
          </StaggerReveal>
        )}
      </div>

      {/* Section: Features - Dynamic from API */}
      {content.features && content.features.length > 0 && (
        <section className="bg-white py-12 border-t border-gray-100">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Why Choose <span className="text-orange">{subCategory.display_name}</span>
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto">
                  Quality products, reliable service, and customer satisfaction guaranteed
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.features.map((feature, index) => (
                <ScrollReveal key={index} direction="up" delay={index * 0.1}>
                  <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="w-14 h-14 mx-auto mb-4 bg-royal-blue/10 rounded-full flex items-center justify-center text-royal-blue">
                      {getIcon(feature.icon)}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section: How to Order - Dynamic from API */}
      {content.how_to_order && content.how_to_order.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-green mb-2">
                  How to Order
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto">
                  Follow these simple steps to get your custom printed products
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.how_to_order.map((step, index) => (
                <ScrollReveal key={step.id} direction="up" delay={index * 0.1}>
                  <div className="relative group">
                    <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300 h-full">
                      <div className="absolute -top-3 -left-3 w-8 h-8 bg-royal-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="w-14 h-14 mx-auto mb-4 bg-royal-blue/10 rounded-full flex items-center justify-center text-royal-blue group-hover:bg-royal-blue group-hover:text-white transition-colors duration-300">
                        {getIcon(step.icon)}
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section: FAQs - Dynamic from API */}
      {content.faqs && content.faqs.length > 0 && (
        <section className="bg-white py-12 border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal direction="up">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gradient-green-orange mb-2">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-gray-500">
                    Find answers to common questions about {subCategory.display_name}
                  </p>
                </div>
              </ScrollReveal>

              <div className="space-y-3">
                {content.faqs.map((faq, index) => (
                  <ScrollReveal key={faq.id} direction="up" delay={index * 0.05}>
                    <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium text-gray-800 pr-4">
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
                        <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const ProductCard: React.FC<{ product: Product; renderStars: (rating: number) => JSX.Element[] }> = ({ product, renderStars }) => {
  const isPOD = product.service_type === 'pod';

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden">
      <Link to={`/products/product/${product.slug}`}>
        <div className="relative overflow-hidden aspect-square">
          <img
            src={getImageUrl(product.primary_image) || '/api/placeholder/400/400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {product.badge && (
            <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-semibold text-white ${
              product.badge_color === 'orange' ? 'bg-orange-500' : 'bg-royal-blue'
            }`}>
              {product.badge}
            </div>
          )}
          {isPOD && (
            <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Customizable
            </div>
          )}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold px-3 py-1 bg-red-500 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/products/product/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 hover:text-royal-blue transition">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-1">
          {renderStars(product.rating)}
          <span className="text-xs text-gray-500 ml-1">({product.review_count})</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-royal-blue">
            ETB {product.price.toLocaleString()}
          </span>
          {product.compare_price && (
            <span className="text-sm text-gray-400 line-through">
              ETB {product.compare_price.toLocaleString()}
            </span>
          )}
        </div>
        <button
          className="w-full mt-3 bg-royal-blue text-white py-2 rounded-lg font-medium hover:bg-royal-blue-dark transition flex items-center justify-center gap-2"
        >
          {isPOD ? <Sparkles className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {isPOD ? 'Customize Now' : 'View Details'}
        </button>
      </div>
    </div>
  );
};

export default SubCategoryProducts;