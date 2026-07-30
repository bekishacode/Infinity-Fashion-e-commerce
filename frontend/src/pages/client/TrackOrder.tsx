// src/pages/client/TrackOrder.tsx

import React, { useState } from 'react';
import { apiClient, getImageUrl } from '../../utils/apiClient';
import { 
  Search, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  ShoppingBag,
  Calendar,
  Phone,
  Hash,
  Sparkles,
  Shield,
  Headphones,
  ArrowRight
} from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

interface StatusHistory {
  id: number;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  created_at: string;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  product_name: string;
  product_price: number;
  quantity: number;
  total_amount: number;
  service_type: string;
  size: string | null;
  color: string | null;
  front_design_url: string | null;
  back_design_url: string | null;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  status_history: StatusHistory[];
}

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string; stepColor: string; description: string }> = {
  pending: { 
    icon: <Clock className="w-5 h-5" />, 
    color: 'text-yellow-600', 
    bg: 'bg-yellow-50',
    label: 'Pending',
    stepColor: 'bg-yellow-400',
    description: 'Your order has been received and is awaiting confirmation'
  },
  confirmed: { 
    icon: <CheckCircle className="w-5 h-5" />, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50',
    label: 'Confirmed',
    stepColor: 'bg-blue-400',
    description: 'Your order has been confirmed and is being prepared'
  },
  processing: { 
    icon: <Package className="w-5 h-5" />, 
    color: 'text-purple-600', 
    bg: 'bg-purple-50',
    label: 'Processing',
    stepColor: 'bg-purple-400',
    description: 'Your order is being processed and prepared for shipment'
  },
  shipped: { 
    icon: <Truck className="w-5 h-5" />, 
    color: 'text-orange-600', 
    bg: 'bg-orange-50',
    label: 'Shipped',
    stepColor: 'bg-orange-400',
    description: 'Your order has been shipped and is on its way to you'
  },
  delivered: { 
    icon: <CheckCircle className="w-5 h-5" />, 
    color: 'text-green-600', 
    bg: 'bg-green-50',
    label: 'Delivered',
    stepColor: 'bg-green-400',
    description: 'Your order has been delivered successfully'
  },
  cancelled: { 
    icon: <XCircle className="w-5 h-5" />, 
    color: 'text-red-600', 
    bg: 'bg-red-50',
    label: 'Cancelled',
    stepColor: 'bg-red-400',
    description: 'Your order has been cancelled'
  },
};

const TrackOrder: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    setSearched(true);

    try {
      const response = await apiClient.get<Order>('/orders', {
        order_number: orderNumber.trim(),
        phone: phone.trim(),
      });

      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setError(response.message || 'Order not found');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? statusSteps.indexOf(order.status) : -1;
  const isCancelled = order?.status === 'cancelled';
  const currentStatus = order?.status || 'pending';

  const getStatusDescription = (status: string) => {
    return statusConfig[status]?.description || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-blue/5 via-white to-orange/5 py-10 mt-14 md:mt-20">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <ScrollReveal direction="up">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-royal-blue/10 text-royal-blue px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Package className="w-4 h-4" />
              Order Tracking
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Track Your <span className="text-royal-blue">Order</span>
            </h1>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter your order number and phone number to get real-time updates on your delivery status
            </p>
          </div>
        </ScrollReveal>

        {/* Search Form */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 mb-8 transition-all hover:shadow-xl">
            <form onSubmit={handleSearch}>
              <div className="grid md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-royal-blue" />
                      Order Number
                    </span>
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. ORD-20260707-0001"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-royal-blue focus:border-transparent transition outline-none bg-gray-50 hover:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-royal-blue" />
                      Phone Number
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone used at checkout"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-royal-blue focus:border-transparent transition outline-none bg-gray-50 hover:bg-white"
                    required
                  />
                </div>
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
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Track Order
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </ScrollReveal>

        {/* Error Message */}
        {searched && !loading && error && (
          <ScrollReveal direction="up">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center mb-6 animate-fadeIn">
              <p className="font-medium">{error}</p>
              <p className="text-sm text-red-500 mt-1">Please check your order number and phone number and try again.</p>
            </div>
          </ScrollReveal>
        )}

        {/* Order Details */}
        {order && (
          <div className="animate-slideUp">
            {/* Order Header */}
            <ScrollReveal direction="up">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-royal-blue/10 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-royal-blue" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Order Number</p>
                      <p className="font-mono font-bold text-lg text-gray-800">{order.order_number}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${statusConfig[order.status].bg} ${statusConfig[order.status].color}`}>
                      {statusConfig[order.status].icon}
                      {statusConfig[order.status].label}
                    </span>
                    <span className="text-sm text-gray-400">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Progress Bar */}
            {!isCancelled && (
              <ScrollReveal direction="up" delay={0.1}>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-royal-blue" />
                      Order Progress
                    </h3>
                    <span className="text-xs text-royal-blue font-medium">
                      {Math.round((currentStepIndex / (statusSteps.length - 1)) * 100)}% Complete
                    </span>
                  </div>
                  <div className="relative">
                    <div className="flex justify-between items-center relative">
                      <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-0" />
                      <div
                        className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-royal-blue to-magenta transition-all duration-700 -z-0"
                        style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                      />
                      {statusSteps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        
                        return (
                          <div key={step} className="flex flex-col items-center relative z-10 group">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                isCompleted 
                                  ? 'bg-royal-blue text-white shadow-lg shadow-royal-blue/30' 
                                  : 'bg-gray-200 text-gray-400'
                              } ${isCurrent ? 'scale-110 ring-4 ring-royal-blue/20' : ''}`}
                            >
                              {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                            </div>
                            <span className={`text-xs font-medium mt-2 capitalize transition-colors ${isCompleted ? 'text-royal-blue' : 'text-gray-400'}`}>
                              {step}
                            </span>
                            {isCurrent && (
                              <div className="absolute -top-12 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {getStatusDescription(step)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                      {getStatusDescription(currentStatus)}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Order Details Grid - Cleaner Colors */}
            <ScrollReveal direction="up" delay={0.2}>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-royal-blue" />
                  Order Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400">Product</p>
                    <p className="font-medium text-gray-800">{order.product_name}</p>
                  </div>
                  {(order.size || order.color) && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-400">Variant</p>
                      <p className="font-medium text-gray-800">{[order.size, order.color].filter(Boolean).join(' / ')}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400">Quantity</p>
                    <p className="font-medium text-gray-800">{order.quantity}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400">Service Type</p>
                    <p className="font-medium text-gray-800 capitalize">{order.service_type}</p>
                  </div>
                  <div className="bg-royal-blue/5 rounded-xl p-4 border border-royal-blue/20 sm:col-span-2">
                    <p className="text-xs text-gray-400">Total Amount</p>
                    <p className="font-bold text-2xl text-royal-blue">ETB {order.total_amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Design Images */}
            {(order.front_design_url || order.back_design_url) && (
              <ScrollReveal direction="up" delay={0.25}>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-royal-blue" />
                    Your Designs
                  </h3>
                  <div className="flex gap-4 flex-wrap">
                    {order.front_design_url && (
                      <div className="group">
                        <p className="text-xs text-gray-400 mb-2">Front Design</p>
                        <div className="relative overflow-hidden rounded-xl">
                          <img
                            src={getImageUrl(order.front_design_url) || undefined}
                            alt="Front design"
                            className="w-24 h-24 md:w-32 md:h-32 object-cover border-2 border-gray-200 group-hover:border-royal-blue transition-all duration-300 group-hover:shadow-lg group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    )}
                    {order.back_design_url && (
                      <div className="group">
                        <p className="text-xs text-gray-400 mb-2">Back Design</p>
                        <div className="relative overflow-hidden rounded-xl">
                          <img
                            src={getImageUrl(order.back_design_url) || undefined}
                            alt="Back design"
                            className="w-24 h-24 md:w-32 md:h-32 object-cover border-2 border-gray-200 group-hover:border-royal-blue transition-all duration-300 group-hover:shadow-lg group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Status History */}
            {order.status_history && order.status_history.length > 0 && (
              <ScrollReveal direction="up" delay={0.3}>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-royal-blue" />
                    Status History
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {order.status_history.map((h, index) => {
                      const isLatest = index === 0;
                      return (
                        <div 
                          key={h.id} 
                          className={`flex items-center gap-4 text-sm p-3 rounded-xl transition-all duration-300 ${
                            isLatest 
                              ? 'bg-royal-blue/5 border border-royal-blue/20' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full ${statusConfig[h.new_status]?.stepColor || 'bg-gray-300'} flex-shrink-0 ${isLatest ? 'animate-pulse' : ''}`} />
                          <span className={`capitalize font-medium ${isLatest ? 'text-royal-blue' : 'text-gray-700'}`}>
                            {h.new_status}
                            {isLatest && (
                              <span className="ml-2 text-xs bg-royal-blue/20 text-royal-blue px-2 py-0.5 rounded-full">
                                Current
                              </span>
                            )}
                          </span>
                          <span className="text-gray-400 text-xs ml-auto flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(h.created_at).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        )}

        {/* Trust Signals */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-royal-blue/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-royal-blue/20 transition-colors">
                <Shield className="w-6 h-6 text-royal-blue" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Secure Tracking</p>
              <p className="text-xs text-gray-400 mt-1">Your information is private and secure</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange/20 transition-colors">
                <Clock className="w-6 h-6 text-orange" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Real-Time Updates</p>
              <p className="text-xs text-gray-400 mt-1">Instant status updates as they happen</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green/20 transition-colors">
                <Headphones className="w-6 h-6 text-green" />
              </div>
              <p className="text-sm font-semibold text-gray-700">24/7 Support</p>
              <p className="text-xs text-gray-400 mt-1">We're here to help anytime</p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default TrackOrder;