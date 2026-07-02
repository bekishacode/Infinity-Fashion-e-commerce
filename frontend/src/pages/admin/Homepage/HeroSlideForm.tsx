// src/pages/admin/Homepage/HeroSlideForm.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../utils/apiClient';
import { HeroSlide, UploadImageResponse } from '../../../types/api.types';
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';

const gradientOptions = [
  { value: 'from-magenta via-magenta-dark to-orange', label: 'Magenta to Orange' },
  { value: 'from-orange via-orange-dark to-royal-blue', label: 'Orange to Royal Blue' },
  { value: 'from-green via-green-dark to-royal-blue', label: 'Green to Royal Blue' },
  { value: 'from-royal-blue via-royal-blue-dark to-magenta', label: 'Royal Blue to Magenta' },
];

// Local image type
interface LocalImage {
  file: File;
  previewUrl: string;
  isUploading?: boolean;
  uploadedUrl?: string;
}

const HeroSlideForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Local image state (not uploaded yet)
  const [localImage, setLocalImage] = useState<LocalImage | null>(null);
  const [existingImage, setExistingImage] = useState<string>('');
  
  const [formData, setFormData] = useState<Partial<HeroSlide>>({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    bg_gradient: 'from-magenta via-magenta-dark to-orange',
    button_text: 'Explore Products',
    button_link: '/products',
    is_active: 1
  });

  useEffect(() => {
    if (isEditing && id) {
      const fetchSlide = async () => {
        setLoading(true);
        try {
          const response = await apiClient.get<HeroSlide>(`/admin/homepage/hero-slides?id=${id}`);
          if (response.success && response.data) {
            setFormData(response.data);
            setExistingImage(response.data.image || '');
          }
        } catch (err) {
          setError('Failed to load slide data');
        } finally {
          setLoading(false);
        }
      };
      fetchSlide();
    }
  }, [id, isEditing]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (localImage?.previewUrl) {
        URL.revokeObjectURL(localImage.previewUrl);
      }
    };
  }, [localImage]);

  const handleChange = (field: keyof HeroSlide, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle image selection - store locally, don't upload yet
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Allowed: JPG, PNG, WEBP');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Max size: 5MB');
      return;
    }

    // Remove old local image preview
    if (localImage?.previewUrl) {
      URL.revokeObjectURL(localImage.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalImage({
      file,
      previewUrl,
      isUploading: false
    });
    
    // Clear the form image field (will be set on save)
    setFormData(prev => ({ ...prev, image: '' }));
    
    event.target.value = ''; // Reset input
  };

  const removeLocalImage = () => {
    if (localImage?.previewUrl) {
      URL.revokeObjectURL(localImage.previewUrl);
    }
    setLocalImage(null);
  };

  // Upload single image to server
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<UploadImageResponse>(
      '/admin/homepage/upload-image', 
      formData
    );
    
    if (!response.success || !response.data?.image_url) {
      throw new Error(response.message || 'Failed to upload image');
    }
    
    return response.data.image_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validate required fields
    if (!formData.title || !formData.subtitle || !formData.description) {
      setError('Title, subtitle and description are required');
      setSubmitting(false);
      return;
    }

    try {
      let imageUrl = existingImage;

      // If there's a local image, upload it now
      if (localImage) {
        try {
          imageUrl = await uploadImage(localImage.file);
        } catch (uploadError) {
          setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload image');
          setSubmitting(false);
          return;
        }
      }

      // Check if image is required (for new slides)
      if (!isEditing && !imageUrl) {
        setError('Image is required');
        setSubmitting(false);
        return;
      }

      const slideData = {
        ...formData,
        image: imageUrl
      };

      const endpoint = isEditing 
        ? `/admin/homepage/hero-slides?id=${id}`
        : '/admin/homepage/hero-slides';
      
      const method = isEditing ? 'put' : 'post';
      const response = await (apiClient as any)[method](endpoint, slideData);
      
      if (response.success) {
        navigate('/admin/homepage');
      } else {
        setError(response.message || 'Failed to save slide');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Clean up local preview
    if (localImage?.previewUrl) {
      URL.revokeObjectURL(localImage.previewUrl);
    }
    navigate('/admin/homepage');
  };

  // Get the image to display (preview > existing)
  const getDisplayImage = () => {
    if (localImage?.previewUrl) return localImage.previewUrl;
    if (existingImage) return existingImage;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-blue"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto mt-14">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/homepage/hero-slides')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-charcoal">
            {isEditing ? 'Edit Hero Slide' : 'Create Hero Slide'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEditing ? 'Update slide details' : 'Add a new slide to the hero carousel'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-blue focus:border-transparent"
              required
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtitle <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subtitle || ''}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-blue focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-blue focus:border-transparent"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image {!isEditing && <span className="text-red-500">*</span>}
            </label>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark transition flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Choose Image
                </button>
                {getDisplayImage() && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocalImage(null);
                      setExistingImage('');
                      setFormData(prev => ({ ...prev, image: '' }));
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Supported: JPG, PNG, WEBP (Max 5MB). Image will be uploaded when you save.
              </p>
              
              {/* Image Preview */}
              {getDisplayImage() && (
                <div className="w-48 h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={getDisplayImage()!}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>`;
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Background Gradient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Gradient
            </label>
            <select
              value={formData.bg_gradient || ''}
              onChange={(e) => handleChange('bg_gradient', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-blue focus:border-transparent"
            >
              {gradientOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className={`mt-2 h-8 w-full rounded-lg bg-gradient-to-r ${formData.bg_gradient || 'from-magenta via-magenta-dark to-orange'}`} />
          </div>

          {/* Button Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Button Text
            </label>
            <input
              type="text"
              value={formData.button_text || 'Explore Products'}
              onChange={(e) => handleChange('button_text', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-blue focus:border-transparent"
            />
          </div>

          {/* Button Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Button Link
            </label>
            <input
              type="text"
              value={formData.button_link || '/products'}
              onChange={(e) => handleChange('button_link', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-blue focus:border-transparent"
            />
          </div>

          {/* Active Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.is_active ?? 1}
              onChange={(e) => handleChange('is_active', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-blue focus:border-transparent"
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark transition disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              isEditing ? 'Update Slide' : 'Create Slide'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HeroSlideForm;