import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { myListingsAPI } from '@/api/dashboard.api';
import { toast } from 'react-hot-toast';

const DEFAULT_CATEGORIES = ['Web Development', 'Mobile App', 'UI/UX Design', 'Data Analysis', 'Cloud Services'];
const DEFAULT_TECH_STACK = ['React', 'Node.js', 'Python', 'AWS', 'MongoDB', 'Vue.js', 'TypeScript'];

export function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  // Fetch listing details
  const listingQuery = useQuery({
    queryKey: ['listing-edit', id],
    queryFn: () => myListingsAPI.getListingDetail(id),
  });

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: listingQuery.data || {},
  });

  // Update listing mutation
  const updateMutation = useMutation({
    mutationFn: (data) => myListingsAPI.updateListing(id, data),
    onSuccess: () => {
      toast.success('Listing updated successfully');
      navigate('/projects/my');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update listing');
    },
  });

  const selectedTechStack = watch('techStack') || [];
  const selectedCategory = watch('category');

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imagePath) => {
    setRemovedImages((prev) => [...prev, imagePath]);
  };

  const toggleTechStack = (tech) => {
    const current = selectedTechStack || [];
    const updated = current.includes(tech)
      ? current.filter((t) => t !== tech)
      : [...current, tech];
    setValue('techStack', updated);
  };

  const onSubmit = async (formData) => {
    const submitData = new FormData();
    
    // Add text fields
    Object.keys(formData).forEach((key) => {
      if (key !== 'techStack' && key !== 'images') {
        submitData.append(key, formData[key]);
      }
    });

    // Add tech stack as JSON
    submitData.append('techStack', JSON.stringify(selectedTechStack));
    
    // Add new images
    imageFiles.forEach((file) => {
      submitData.append('images', file);
    });

    // Add removed image paths
    if (removedImages.length > 0) {
      submitData.append('removedImages', JSON.stringify(removedImages));
    }

    updateMutation.mutate(submitData);
  };

  if (listingQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-accent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading listing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/projects/my')}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-6 w-6 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Listing</h1>
          <p className="text-gray-600 dark:text-gray-400">Update your listing details</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Title
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              type="text"
              placeholder="Enter listing title"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Description
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              placeholder="Describe your offering in detail"
              rows={6}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Category
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select category</option>
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing */}
          <div className="grid gap-6 sm:grid-cols-2 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Price (₹)
              </label>
              <input
                {...register('price', { required: 'Price is required' })}
                type="number"
                step="100"
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Discount (%)
              </label>
              <input
                {...register('discount')}
                type="number"
                min="0"
                max="100"
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Tech Stack
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {DEFAULT_TECH_STACK.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleTechStack(tech)}
                  className={`rounded-lg border px-4 py-2 font-medium transition ${
                    selectedTechStack.includes(tech)
                      ? 'border-primary bg-primary/10 text-primary dark:border-accent dark:bg-accent/10 dark:text-accent'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Key Features (comma-separated)
            </label>
            <textarea
              {...register('features')}
              placeholder="e.g., Responsive Design, SEO Optimized, Mobile App"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Includes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              What's Included (comma-separated)
            </label>
            <textarea
              {...register('includes')}
              placeholder="e.g., Source Code, Documentation, Support"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Images */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Images
            </label>

            {/* Existing Images */}
            {listingQuery.data?.images && listingQuery.data.images.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Images:</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {listingQuery.data.images.map((image, idx) => {
                    if (removedImages.includes(image)) return null;
                    return (
                      <div key={idx} className="relative">
                        <img
                          src={image}
                          alt={`Listing ${idx}`}
                          className="h-24 w-full rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(image)}
                          className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* New Images */}
            {previewImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">New Images:</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {previewImages.map((preview, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${idx}`}
                        className="h-24 w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Input */}
            <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-primary dark:border-gray-600 dark:hover:border-accent">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-500 dark:text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Delivery Time */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Delivery Time (days)
            </label>
            <input
              {...register('deliveryTime')}
              type="number"
              min="1"
              placeholder="7"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Support */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('hasSupport')}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Offer technical support
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex-1 rounded-lg bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90 disabled:opacity-50 dark:bg-accent dark:hover:bg-accent/90"
          >
            {updateMutation.isPending ? 'Updating...' : 'Update Listing'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/projects/my')}
            className="rounded-lg border border-gray-300 px-6 py-3 font-bold text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
