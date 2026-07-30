// src/pages/client/Checkout.tsx

import React, { useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { apiClient, getImageUrl } from '../../utils/apiClient';
import { Upload, X, CheckCircle, ArrowLeft, Package } from 'lucide-react';

interface CheckoutState {
  product: {
    id: number;
    name: string;
    price: number;
    service_type: 'wholesale' | 'retail' | 'pod';
    min_quantity: number;
  };
  variant?: {
    id: number;
    size: string;
    color: string;
    price_adjustment: number;
  } | null;
  quantity: number;
  frontImage?: string | null; // product's own front image, for mockup base
  backImage?: string | null;
  frontDesign?: File | null; // customer uploaded design
  backDesign?: File | null;
}

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CheckoutState | null;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [designInstructions, setDesignInstructions] = useState('');
  const [notes, setNotes] = useState('');

  const [frontDesign, setFrontDesign] = useState<File | null>(state?.frontDesign || null);
  const [backDesign, setBackDesign] = useState<File | null>(state?.backDesign || null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [mockupSide, setMockupSide] = useState<'front' | 'back'>('front');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Build preview URLs for design files
  React.useEffect(() => {
    if (frontDesign) {
      const url = URL.createObjectURL(frontDesign);
      setFrontPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFrontPreview(null);
    }
  }, [frontDesign]);

  React.useEffect(() => {
    if (backDesign) {
      const url = URL.createObjectURL(backDesign);
      setBackPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setBackPreview(null);
    }
  }, [backDesign]);

  // No product passed in - redirect back
  if (!state || !state.product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No product selected for checkout.</p>
          <Link to="/products" className="text-royal-blue hover:underline">Browse Products</Link>
        </div>
      </div>
    );
  }

  const { product, variant, quantity } = state;
  const isPOD = product.service_type === 'pod';
  const unitPrice = product.price + (variant?.price_adjustment || 0);
  const totalAmount = unitPrice * quantity;

  const handleDesignSelect = (type: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Allowed: JPG, PNG, WEBP');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Max size: 10MB');
      return;
    }
    setError('');

    if (type === 'front') setFrontDesign(file);
    else setBackDesign(file);

    e.target.value = '';
  };

  const uploadDesign = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post<{ image_url: string }>('/orders/upload-design', formData);
    if (!response.success || !response.data?.image_url) {
      throw new Error(response.message || 'Failed to upload design');
    }
    return response.data.image_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!customerName || !customerPhone || !customerAddress) {
      setError('Name, phone, and address are required');
      setSubmitting(false);
      return;
    }

    if (isPOD && !frontDesign) {
      setError('Please upload a front design for this custom product');
      setSubmitting(false);
      return;
    }

    try {
      let frontDesignUrl: string | null = null;
      let backDesignUrl: string | null = null;

      if (isPOD && frontDesign) {
        frontDesignUrl = await uploadDesign(frontDesign);
      }
      if (isPOD && backDesign) {
        backDesignUrl = await uploadDesign(backDesign);
      }

      const orderPayload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || undefined,
        customer_address: customerAddress,
        product_id: product.id,
        product_name: product.name,
        product_price: unitPrice,
        quantity: quantity,
        service_type: product.service_type,
        size: variant?.size || undefined,
        color: variant?.color || undefined,
        design_instructions: designInstructions || undefined,
        front_design_url: frontDesignUrl || undefined,
        back_design_url: backDesignUrl || undefined,
        notes: notes || undefined,
      };

      const response = await apiClient.post<{ order_number: string }>('/orders', orderPayload);

      if (response.success && response.data) {
        setOrderNumber(response.data.order_number);
      } else {
        setError(response.message || 'Failed to place order');
      }
    } catch (err) {
      setError('Something went wrong while placing your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen
  if (orderNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 mt-14">
        <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-4">
            Your order number is
          </p>
          <div className="bg-gray-50 rounded-lg py-3 px-4 font-mono text-lg font-semibold text-royal-blue mb-6">
            {orderNumber}
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Save this number along with your phone number to track your order status anytime.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/track-order"
              className="bg-royal-blue text-white py-2 rounded-lg font-medium hover:bg-royal-blue-dark transition"
            >
              Track This Order
            </Link>
            <Link to="/products" className="text-gray-500 hover:text-gray-700 text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const mockupBaseImage = mockupSide === 'front' ? state.frontImage : state.backImage;
  const mockupDesignPreview = mockupSide === 'front' ? frontPreview : backPreview;

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* LEFT: Order summary + POD mockup/upload */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Order Summary</h2>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Product</span>
              <span className="font-medium">{product.name}</span>
            </div>
            {variant && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Variant</span>
                <span className="font-medium">{variant.size} / {variant.color}</span>
              </div>
            )}
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Quantity</span>
              <span className="font-medium">{quantity}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Unit Price</span>
              <span className="font-medium">ETB {unitPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t pt-3 mt-3">
              <span>Total</span>
              <span className="text-royal-blue">ETB {totalAmount.toLocaleString()}</span>
            </div>

            {isPOD && (
              <div className="mt-6 border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-3">Customize Your Design</h3>

                {/* Mockup preview */}
                {(state.frontImage || state.backImage) && (
                  <div className="mb-4">
                    <div className="flex gap-2 mb-2">
                      {state.frontImage && (
                        <button
                          type="button"
                          onClick={() => setMockupSide('front')}
                          className={`px-3 py-1 text-xs rounded-full ${mockupSide === 'front' ? 'bg-royal-blue text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                          Front
                        </button>
                      )}
                      {state.backImage && (
                        <button
                          type="button"
                          onClick={() => setMockupSide('back')}
                          className={`px-3 py-1 text-xs rounded-full ${mockupSide === 'back' ? 'bg-royal-blue text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                          Back
                        </button>
                      )}
                    </div>
                    <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                      {mockupBaseImage && (
                        <img
                          src={getImageUrl(mockupBaseImage) || undefined}
                          alt="Product"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      )}
                      {mockupDesignPreview && (
                        <img
                          src={mockupDesignPreview}
                          alt="Your design"
                          className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[40%] object-contain pointer-events-none"
                        />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Preview only - actual print placement may vary</p>
                  </div>
                )}

                {/* Front design upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Front Design <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    ref={frontInputRef}
                    onChange={(e) => handleDesignSelect('front', e)}
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => frontInputRef.current?.click()}
                      className="px-3 py-2 bg-gray-100 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-200"
                    >
                      <Upload className="w-4 h-4" />
                      {frontDesign ? 'Change' : 'Upload'}
                    </button>
                    {frontDesign && (
                      <>
                        <span className="text-xs text-gray-500 truncate max-w-[150px]">{frontDesign.name}</span>
                        <button type="button" onClick={() => setFrontDesign(null)} className="text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Back design upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Back Design (Optional)</label>
                  <input
                    type="file"
                    ref={backInputRef}
                    onChange={(e) => handleDesignSelect('back', e)}
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => backInputRef.current?.click()}
                      className="px-3 py-2 bg-gray-100 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-200"
                    >
                      <Upload className="w-4 h-4" />
                      {backDesign ? 'Change' : 'Upload'}
                    </button>
                    {backDesign && (
                      <>
                        <span className="text-xs text-gray-500 truncate max-w-[150px]">{backDesign.name}</span>
                        <button type="button" onClick={() => setBackDesign(null)} className="text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Design Instructions (Optional)</label>
                  <textarea
                    value={designInstructions}
                    onChange={(e) => setDesignInstructions(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-royal-blue focus:outline-none"
                    placeholder="Any specific instructions for printing your design..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Customer info form */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Your Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-royal-blue focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-royal-blue focus:outline-none"
                  placeholder="e.g. 09XXXXXXXX"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-royal-blue focus:outline-none"
                  placeholder="For order confirmation email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-royal-blue focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-royal-blue focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-royal-blue text-white py-3 rounded-lg font-semibold hover:bg-royal-blue-dark transition disabled:opacity-50"
              >
                {submitting ? 'Placing Order...' : `Place Order - ETB ${totalAmount.toLocaleString()}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
