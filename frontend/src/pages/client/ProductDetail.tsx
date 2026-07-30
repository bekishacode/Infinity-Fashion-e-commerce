import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient, getImageUrl } from '../../utils/apiClient';
import ReviewSection from '../../components/products/ReviewSection';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Minus, 
  Plus, 
  Truck, 
  Shield, 
  RefreshCw,
  Sparkles,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Eye
} from 'lucide-react';
import { Package } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  service_type: 'wholesale' | 'retail' | 'pod';
  category: string;
  category_slug: string;
  sub_category: string | null;
  sub_category_slug: string | null;
  badge: string | null;
  badge_color: string | null;
  rating: number;
  review_count: number;
  description: string;
  material: string | null;
  care_instructions: string | null;
  weight: number | null;
  in_stock: number;
  min_quantity: number;
  variants: Variant[];
  images: ProductImage[];
  related_products: RelatedProduct[];
}

interface Variant {
  id: number;
  size: string;
  color: string;
  color_code: string;
  price_adjustment: number;
  stock_quantity: number;
}

interface ProductImage {
  id: number;
  image_url: string;
  alt_text: string;
  image_type: string;
  is_primary: number;
  sort_order: number;
}

interface RelatedProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  primary_image: string | null;
  rating: number;
}

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('specs');
  const [showPodDesigner, setShowPodDesigner] = useState(false);
  const [frontDesign, setFrontDesign] = useState<File | null>(null);
  const [backDesign, setBackDesign] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (product && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
    if (product && product.images && product.images.length > 0) {
      const primary = product.images.find(img => img.is_primary);
      setSelectedImage(primary?.image_url || product.images[0]?.image_url || null);
    }
  }, [product]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/products/detail?slug=${slug}`);
      if (response.success && response.data) {
          setProduct(response.data as Product);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSelect = (variant: Variant) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };

  const handleQuantityChange = (newQuantity: number) => {
    const minQty = product?.min_quantity || 1;
    // No max limit - this is a custom order/print business, not fixed inventory.
    // Customers can request any quantity; fulfillment is handled manually.
    if (newQuantity >= minQty) {
      setQuantity(newQuantity);
    }
  };

  // Helper: find product's own front/back images (for POD mockup base)
  // Prefers proper image_type tagging if set; falls back to sort_order
  // convention (0 = main/thumbnail, 1 = front, 2 = back) for existing data
  // where every image is currently tagged as 'detail'.
  const getProductImageByType = (type: 'front' | 'back'): string | null => {
    if (!product?.images || product.images.length === 0) return null;

    // Preferred: properly tagged image_type
    const tagged = product.images.find(i => i.image_type === type);
    if (tagged) return tagged.image_url;

    // Fallback: sort_order convention (1 = front, 2 = back)
    const fallbackSortOrder = type === 'front' ? 1 : 2;
    const bySortOrder = product.images.find(i => i.sort_order === fallbackSortOrder);
    if (bySortOrder) return bySortOrder.image_url;

    // Last resort for front only: use the primary/first image
    if (type === 'front') {
      const primary = product.images.find(i => i.is_primary === 1);
      return primary?.image_url || product.images[0]?.image_url || null;
    }

    return null;
  };

  // ============================================
  // Add to Cart - navigates to Checkout with product info
  // ============================================
  const handleAddToCart = () => {
    if (!product) return;

    navigate('/checkout', {
      state: {
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          service_type: product.service_type,
          min_quantity: product.min_quantity || 1,
        },
        variant: selectedVariant
          ? {
              id: selectedVariant.id,
              size: selectedVariant.size,
              color: selectedVariant.color,
              price_adjustment: selectedVariant.price_adjustment,
            }
          : null,
        quantity: quantity,
      },
    });
  };

  const getCurrentPrice = () => {
    if (!product) return 0;
    const basePrice = product.price;
    const adjustment = selectedVariant?.price_adjustment || 0;
    return basePrice + adjustment;
  };

  const handleFileUpload = (type: 'front' | 'back', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'front') {
        setFrontDesign(file);
        setFrontPreview(reader.result as string);
      } else {
        setBackDesign(file);
        setBackPreview(reader.result as string);
      }
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  // ============================================
  // POD Order - navigates to Checkout with product + design files
  // ============================================
  const handlePodOrder = () => {
    if (!product) return;

    navigate('/checkout', {
      state: {
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          service_type: product.service_type,
          min_quantity: product.min_quantity || 1,
        },
        variant: selectedVariant
          ? {
              id: selectedVariant.id,
              size: selectedVariant.size,
              color: selectedVariant.color,
              price_adjustment: selectedVariant.price_adjustment,
            }
          : null,
        quantity: quantity,
        frontImage: getProductImageByType('front'),
        backImage: getProductImageByType('back'),
        frontDesign: frontDesign,
        backDesign: backDesign,
      },
    });
    setShowPodDesigner(false);
  };

  const nextImage = () => {
    if (product && product.images && currentImageIndex < product.images.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(product.images[newIndex].image_url);
    }
  };

  const prevImage = () => {
    if (product && product.images && currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(product.images[newIndex].image_url);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-royal-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-body text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-body text-gray-500 mb-4">Product not found</p>
          <button onClick={() => navigate('/products')} className="text-royal-blue hover:underline">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const currentPrice = getCurrentPrice();
  const sizes = Array.from(new Set(product.variants.map(v => v.size)));
  const colors = Array.from(new Set(product.variants.map(v => v.color)));
  const isPOD = product.service_type === 'pod';

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-body-sm text-gray-500 mb-6 flex-wrap sm:mt-24 mt-12">
          <Link to="/" className="hover:text-royal-blue">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-royal-blue">Products</Link>
          <span>/</span>
          <Link to={`/products/category/${product.category_slug}`} className="hover:text-royal-blue">
            {product.category}
          </Link>
          {product.sub_category && (
            <>
              <span>/</span>
              <Link to={`/products/category/${product.category_slug}/${product.sub_category_slug}`} className="hover:text-royal-blue">
                {product.sub_category}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-800">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-0">
          {/* Product Images - Balanced size with more height */}
          <div className="max-w-2xl">
            <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <img
                src={getImageUrl(selectedImage) || '/api/placeholder/600/600'}
                alt={product.name}
                className="w-full h-auto max-h-[650px] object-contain bg-gray-100"
              />
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                    className="absolute text-white left-4 top-1/2 transform -translate-y-1/2 p-2 bg-green rounded-full shadow-lg hover:bg-green-dark disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    disabled={currentImageIndex === product.images.length - 1}
                    className="absolute text-white right-4 top-1/2 transform -translate-y-1/2 p-2 bg-green rounded-full shadow-lg hover:bg-green-dark disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails - Balanced size */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2.5 mt-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setSelectedImage(image.image_url);
                    }}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                      selectedImage === image.image_url ? 'border-royal-blue' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={getImageUrl(image.image_url) || '/api/placeholder/400/400'}
                      alt={image.alt_text || product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className='sm:mt-0 mt-4'>
            {/* Badge */}
            {product.badge && (
              <div className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold text-white mb-4 ${
                product.badge_color === 'orange' ? 'bg-orange-500' : 'bg-royal-blue'
              }`}>
                {product.badge}
              </div>
            )}

            <h1 className="heading-md text-gray-800 mb-2">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {renderStars(product.rating)}
              </div>
              <span className="text-body-sm text-gray-500">
                {product.rating} ({product.review_count} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="price-md text-royal-blue">
                ETB {currentPrice.toLocaleString()}
              </div>
              {product.compare_price && (
                <div className="text-body-sm text-gray-400 line-through">
                  ETB {product.compare_price.toLocaleString()}
                </div>
              )}
            </div>

            <p className="text-body text-gray-600 mb-6 text-justify sm:mr-0 mr-2 sm:ml-0 ml-2">{product.description}</p>

            {/* Variants */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <label className="block text-body-sm font-medium text-gray-700 mb-2">Size</label>
                <div className="flex flex-wrap gap-3">
                  {sizes.map(size => {
                    const variant = product.variants.find(v => v.size === size);
                    return (
                      <button
                        key={size}
                        onClick={() => variant && handleVariantSelect(variant)}
                        className={`px-4 py-2 border rounded-lg transition text-body-sm ${
                          selectedVariant?.size === size
                            ? 'border-royal-blue bg-royal-blue/10 text-royal-blue'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div className="mb-6">
                <label className="block text-body-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-3">
                  {colors.map(color => {
                    const variant = product.variants.find(v => v.color === color);
                    return (
                      <button
                        key={color}
                        onClick={() => variant && handleVariantSelect(variant)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition text-body-sm ${
                          selectedVariant?.color === color
                            ? 'border-royal-blue bg-royal-blue/10 text-royal-blue'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: variant?.color_code || '#000' }}
                        />
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-body-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= (product.min_quantity || 1)}
                  className="w-10 h-10 flex items-center justify-center border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      handleQuantityChange(val);
                    } else if (e.target.value === '') {
                      setQuantity(0);
                    }
                  }}
                  onBlur={() => {
                    const minQty = product?.min_quantity || 1;
                    if (!quantity || quantity < minQty) {
                      setQuantity(minQty);
                    }
                  }}
                  min={product?.min_quantity || 1}
                  className="w-20 text-center font-medium border rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-royal-blue [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
                {product.min_quantity > 1 && (
                  <span className="text-body-sm text-gray-500">Min. order: {product.min_quantity}</span>
                )}
              </div>
            </div>

            {/* Stock status removed - made-to-order, no fixed inventory limit shown to customers */}

            {/* Add to Cart Button */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={isPOD ? () => setShowPodDesigner(true) : handleAddToCart}
                className="flex-1 bg-royal-blue text-white py-3 rounded-lg font-semibold hover:bg-royal-blue-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-cta"
              >
                {isPOD ? <Sparkles className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                {isPOD ? 'Customize & Order' : 'Add to Cart'}
              </button>
              <button className="p-3 border rounded-lg hover:bg-gray-50 transition">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-3 border rounded-lg hover:bg-gray-50 transition">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Added to Cart Message */}
            {addedToCart && (
              <div className="mb-6 p-3 bg-green-50 text-green-600 rounded-lg flex items-center gap-2 animate-fade-in">
                <Check className="w-5 h-5" />
                Product added to cart!
              </div>
            )}

            {/* Features */}
            <div className="border-t pt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-body-sm font-medium">Free Shipping</div>
                  <div className="text-body-sm text-gray-500">On orders over ETB 1000</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-body-sm font-medium">Secure Payment</div>
                  <div className="text-body-sm text-gray-500">100% secure transactions</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-body-sm font-medium">Easy Returns</div>
                  <div className="text-body-sm text-gray-500">7 days return policy</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-body-sm font-medium">Premium Quality</div>
                  <div className="text-body-sm text-gray-500">High-quality materials</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12 bg-white rounded-xl shadow-sm">
          <div className="border-b flex flex-wrap gap-8 px-6">
            {[
              { id: 'details', label: 'Product Details' },
              { id: 'specs', label: 'Specifications' },
              { id: 'reviews', label: `Reviews (${product.review_count})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 font-medium border-b-2 transition text-body-sm ${
                  activeTab === tab.id
                    ? 'border-royal-blue text-royal-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'details' && (
              <div className="prose max-w-none text-body">
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid md:grid-cols-2 gap-4 text-body">
                {product.material && (
                  <div className="flex border-b pb-2">
                    <span className="w-32 text-gray-500">Material:</span>
                    <span>{product.material}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex border-b pb-2">
                    <span className="w-32 text-gray-500">Weight:</span>
                    <span>{product.weight} kg</span>
                  </div>
                )}
                {product.care_instructions && (
                  <div className="flex col-span-2 border-b pb-2">
                    <span className="w-32 text-gray-500">Care Instructions:</span>
                    <span>{product.care_instructions}</span>
                  </div>
                )}
                <div className="flex border-b pb-2">
                  <span className="w-32 text-gray-500">Category:</span>
                  <span>{product.category}</span>
                </div>
                {product.sub_category && (
                  <div className="flex border-b pb-2">
                    <span className="w-32 text-gray-500">Sub-category:</span>
                    <span>{product.sub_category}</span>
                  </div>
                )}
                <div className="flex border-b pb-2">
                  <span className="w-32 text-gray-500">Service Type:</span>
                  <span className="capitalize">{product.service_type}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-32 text-gray-500">Minimum Order:</span>
                  <span>{product.min_quantity} unit(s)</span>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewSection
                  productId={product.id}
                  productName={product.name}
                  initialRating={product.rating}
                  initialReviewCount={product.review_count}
                  onReviewAdded={() => {
                    fetchProduct();
                  }}
                />
              )}
          </div>
        </div>

        {/* Related Products */}
        {product.related_products && product.related_products.length > 0 && (
          <div className="mt-12">
            <h2 className="heading-lg text-gray-800 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.related_products.map((related) => (
                <Link key={related.id} to={`/products/product/${related.slug}`} className="group">
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={getImageUrl(related.primary_image) || '/api/placeholder/200/200'}
                        alt={related.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="heading-sm text-gray-800 line-clamp-2">{related.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(related.rating)}
                      </div>
                      <div className="price-sm text-royal-blue mt-1">
                        ETB {related.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* POD Designer Modal */}
      {showPodDesigner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="heading-md">Customize Your {product.name}</h2>
              <button onClick={() => setShowPodDesigner(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Front Design */}
                <div>
                  <label className="block text-body-sm font-medium mb-2">Front Design</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {frontPreview ? (
                      <div className="relative">
                        <img src={frontPreview} alt="Front preview" className="w-full rounded-lg" />
                        <button
                          onClick={() => {
                            setFrontDesign(null);
                            setFrontPreview(null);
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-body-sm text-gray-500">Upload front design (PNG, JPG)</p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload('front', e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
                
                {/* Back Design */}
                <div>
                  <label className="block text-body-sm font-medium mb-2">Back Design (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {backPreview ? (
                      <div className="relative">
                        <img src={backPreview} alt="Back preview" className="w-full rounded-lg" />
                        <button
                          onClick={() => {
                            setBackDesign(null);
                            setBackPreview(null);
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-body-sm text-gray-500">Upload back design (Optional)</p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload('back', e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="heading-sm mb-2">Design Guidelines:</h3>
                <ul className="text-body-sm text-gray-500 space-y-1">
                  <li>• Use high-resolution images (minimum 300 DPI)</li>
                  <li>• Supported formats: PNG, JPG, SVG</li>
                  <li>• Transparent background recommended for best results</li>
                  <li>• Maximum file size: 10MB</li>
                </ul>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setShowPodDesigner(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition text-body-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePodOrder}
                  disabled={!frontPreview}
                  className="px-6 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark transition disabled:opacity-50 text-cta"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
