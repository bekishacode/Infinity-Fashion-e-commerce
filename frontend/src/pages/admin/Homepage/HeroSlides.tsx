// src/pages/admin/Homepage/HeroSlides.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../../utils/apiClient';
import { HeroSlide } from '../../../types/api.types';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';

const HeroSlides: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Fetch slides
  const fetchSlides = async () => {
    try {
      const response = await apiClient.get<HeroSlide[]>('/admin/homepage/hero-slides');
      if (response.success && response.data) {
        setSlides(response.data);
      }
    } catch (err) {
      setError('Failed to load hero slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  // Toggle active status
  const toggleActive = async (id: number, currentStatus: number) => {
    try {
      const response = await apiClient.put(`/admin/homepage/hero-slides/${id}`, {
        is_active: currentStatus === 1 ? 0 : 1
      });
      if (response.success) {
        fetchSlides();
      }
    } catch (err) {
      setError('Failed to update slide status');
    }
  };

  // Delete slide - show confirmation
  const confirmDelete = (id: number) => {
    setDeleteTargetId(id);
    setShowConfirmModal(true);
  };

  // Execute delete
  const handleDelete = async () => {
    if (!deleteTargetId) return;
    
    try {
      const response = await apiClient.delete(`/admin/homepage/hero-slides/${deleteTargetId}`);
      if (response.success) {
        fetchSlides();
      }
    } catch (err) {
      setError('Failed to delete slide');
    } finally {
      setShowConfirmModal(false);
      setDeleteTargetId(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowConfirmModal(false);
    setDeleteTargetId(null);
  };

  // Move slide up/down
  const moveSlide = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(s => s.id === id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === slides.length - 1) return;

    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    const currentSort = newSlides[currentIndex].sort_order;
    const targetSort = newSlides[targetIndex].sort_order;
    
    newSlides[currentIndex].sort_order = targetSort;
    newSlides[targetIndex].sort_order = currentSort;
    
    newSlides.sort((a, b) => a.sort_order - b.sort_order);
    setSlides(newSlides);

    try {
      const order = newSlides.map(s => s.id);
      await apiClient.post('/admin/homepage/reorder-hero-slides', { order });
    } catch (err) {
      fetchSlides();
      setError('Failed to reorder slides');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-blue"></div>
      </div>
    );
  }

  return (
    <div className="p-6 mt-14">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Hero Slides</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your homepage hero carousel slides</p>
        </div>
        <Link
          to="/admin/homepage/hero-slides/create"
          className="bg-royal-blue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-royal-blue-dark transition"
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {slides.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No hero slides yet. Create your first slide!</p>
          <Link
            to="/admin/homepage/hero-slides/create"
            className="inline-block mt-4 bg-royal-blue text-white px-6 py-2 rounded-lg hover:bg-royal-blue-dark transition"
          >
            Create First Slide
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Order</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Image</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Title</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Subtitle</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {slides.map((slide, index) => (
                  <tr key={slide.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 w-6">{index + 1}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => moveSlide(slide.id, 'up')}
                            disabled={index === 0}
                            className={`p-1 rounded hover:bg-gray-200 ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveSlide(slide.id, 'down')}
                            disabled={index === slides.length - 1}
                            className={`p-1 rounded hover:bg-gray-200 ${index === slides.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {slide.image ? (
                          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl"></span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-charcoal">{slide.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{slide.subtitle}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(slide.id, slide.is_active)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                          slide.is_active === 1
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {slide.is_active === 1 ? (
                          <>
                            <Eye className="w-3 h-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/homepage/hero-slides/edit/${slide.id}`}
                          className="p-2 text-gray-500 hover:text-royal-blue hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => confirmDelete(slide.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* CONFIRM DELETE MODAL */}
      {/* ============================================ */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-charcoal">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete this hero slide? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSlides;