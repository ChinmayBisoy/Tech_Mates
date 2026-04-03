import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listingAPI } from '@/api/listing.api';
import { useAuth } from '@/hooks/useAuth';
import { SKILLS, LISTING_TYPES } from '@/utils/constants';
import { Loader, Upload, X } from 'lucide-react';
import { useState } from 'react';
import AIProjectRefiner from '@/components/ai/AIProjectRefiner';
import AIDescriptionGenerator from '@/components/ai/AIDescriptionGenerator';

const postListingSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().min(100, 'Description must be at least 100 characters').max(5000, 'Description cannot exceed 5000 characters'),
  type: z.string().min(1, 'Please select a type'),
  techStack: z.array(z.string()).min(1, 'Please add at least one technology').max(10, 'Maximum 10 technologies allowed'),
  price: z.number().min(1000, 'Price must be at least ₹10 (1000 paise)').max(99999999, 'Price is too high'),
  originalPrice: z.number().optional(),
  features: z.string().min(20, 'Features must be at least 20 characters'),
  includes: z.string().min(10, 'Please specify what is included'),
  documentation: z.string().optional(),
  support: z.enum(['none', '30-days', '90-days', '1-year']),
});

export default function PostListing() {
  const navigate = useNavigate();
  const { user, isDeveloper } = useAuth();
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(postListingSchema),
    defaultValues: {
      title: '',
      description: '',
      type: '',
      techStack: [],
      price: 50000,
      features: '',
      includes: '',
      documentation: '',
      support: 'none',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('type', data.type);
      formData.append('techStack', JSON.stringify(selectedTechs));
      formData.append('price', Math.round(data.price * 100));
      if (data.originalPrice) formData.append('originalPrice', Math.round(data.originalPrice * 100));
      formData.append('features', data.features);
      formData.append('includes', data.includes);
      if (data.documentation) formData.append('documentation', data.documentation);
      formData.append('support', data.support);
      
      images.forEach((image) => {
        formData.append('images', image);
      });

      return listingAPI.createListing(formData);
    },
    onSuccess: (data) => {
      toast.success('Listing created successfully!');
      navigate(`/projects/${data.slug}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create listing');
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (selectedTechs.length === 0) {
      toast.error('Please select at least one technology');
      return;
    }
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }
    createMutation.mutate({ ...data, techStack: selectedTechs });
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const maxFiles = 5;

    if (images.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error(`${file.name} is too large (max 5MB)`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return;
      }

      setImages((prev) => [...prev, file]);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDescriptionRefine = (refinedDescription) => {
    setValue('description', refinedDescription);
    toast.success('Description updated with AI suggestions!');
  };

  const handleGeneratedContent = (generatedData) => {
    // Set description
    if (generatedData.description) {
      setValue('description', generatedData.description);
    }

    // Set tech stack if available
    if (generatedData.skills && Array.isArray(generatedData.skills)) {
      const techsToAdd = generatedData.skills.filter(skill => 
        SKILLS.some(s => s.toLowerCase() === skill.toLowerCase())
      );
      if (techsToAdd.length > 0) {
        setSelectedTechs(techsToAdd);
        setValue('techStack', techsToAdd, { shouldValidate: true, shouldDirty: true });
      }
    }

    // Set price/budget if available (parse from string like "₹30,000-50,000")
    if (generatedData.estimatedBudget) {
      const budgetString = generatedData.estimatedBudget;
      // Extract numbers from budget string (e.g., "₹30,000-50,000" -> ["30000", "50000"])
      const numbers = budgetString.match(/\d+(\,\d+)*/g);
      if (numbers && numbers.length >= 1) {
        // Use the first number for price (in rupees, not paise)
        const price = parseInt(numbers[0].replace(/,/g, ''));
        setValue('price', price);
        
        // Use the second number for original price if available
        if (numbers.length >= 2) {
          const originalPrice = parseInt(numbers[1].replace(/,/g, ''));
          setValue('originalPrice', originalPrice);
        }
      }
    }

    toast.success('All details auto-filled! Review and submit.');
  };

  // Check user role
  if (!isDeveloper) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-900/20">
            <h2 className="text-lg font-bold text-red-900 dark:text-red-200">Access Denied</h2>
            <p className="mt-2 text-red-800 dark:text-red-300">Only developers can post listings. Please switch to developer mode to continue.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Post a Listing</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sell your project or tool to thousands of developers
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-6 rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-900 dark:text-white">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              {...register('title')}
              maxLength={150}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
              placeholder="e.g., React Dashboard Template"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Maximum 150 characters</p>
          </div>

          {/* AI Description Generator from Title */}
          <AIDescriptionGenerator 
            projectTitle={watch('title')}
            onDescriptionGenerated={handleGeneratedContent}
          />

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-semibold text-gray-900 dark:text-white">
              Project Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              {...register('type')}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
            >
              <option value="">Select a type</option>
              {LISTING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>}
          </div>

          {/* AI Project Refiner */}
          <AIProjectRefiner 
            onDescriptionChange={handleDescriptionRefine}
            initialDescription={watch('description')}
          />

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-900 dark:text-white">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={6}
              maxLength={5000}
              className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
              placeholder="Describe your project, its features, and target users..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimum 100, maximum 5000 characters</p>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
              Technologies Used <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => {
                    if (selectedTechs.includes(skill)) {
                      setSelectedTechs(selectedTechs.filter((s) => s !== skill));
                    } else if (selectedTechs.length < 10) {
                      setSelectedTechs([...selectedTechs, skill]);
                    } else {
                      toast.error('Maximum 10 technologies allowed');
                    }
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                    selectedTechs.includes(skill)
                      ? 'bg-primary text-white dark:bg-accent'
                      : 'border border-gray-300 text-gray-700 hover:border-primary dark:border-gray-600 dark:text-gray-300 dark:hover:border-accent'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            {selectedTechs.length === 0 && <p className="mt-1 text-sm text-red-600 dark:text-red-400">Please select at least one technology</p>}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Selected: {selectedTechs.length}/10 technologies
            </p>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
              Images <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
              <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Click to upload images</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">PNG, JPG up to 5MB each (max 5 images)</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-2 w-full cursor-pointer"
              />
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${idx + 1}`}
                      className="aspect-video w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-red-600 p-1 text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {images.length === 0 && <p className="mt-2 text-sm text-red-600 dark:text-red-400">Please upload at least one image</p>}
          </div>

          {/* Features */}
          <div>
            <label htmlFor="features" className="block text-sm font-semibold text-gray-900 dark:text-white">
              Key Features <span className="text-red-500">*</span>
            </label>
            <textarea
              id="features"
              {...register('features')}
              rows={4}
              maxLength={1000}
              className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
              placeholder="List the key features (e.g., Responsive design, Dark mode, Admin panel)"
            />
            {errors.features && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.features.message}</p>}
          </div>

          {/* Includes */}
          <div>
            <label htmlFor="includes" className="block text-sm font-semibold text-gray-900 dark:text-white">
              What's Included <span className="text-red-500">*</span>
            </label>
            <textarea
              id="includes"
              {...register('includes')}
              rows={4}
              maxLength={1000}
              className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
              placeholder="Describe deliverables (source code, documentation, etc.)"
            />
            {errors.includes && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.includes.message}</p>}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-gray-900 dark:text-white">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                {...register('price', { valueAsNumber: true })}
                min={100}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
                placeholder="50000"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price.message}</p>}
            </div>
            <div>
              <label htmlFor="originalPrice" className="block text-sm font-semibold text-gray-900 dark:text-white">
                Original Price (₹) <span className="text-gray-500 text-sm font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                id="originalPrice"
                {...register('originalPrice', { valueAsNumber: true })}
                min={100}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
                placeholder="75000"
              />
            </div>
          </div>

          {/* Support */}
          <div>
            <label htmlFor="support" className="block text-sm font-semibold text-gray-900 dark:text-white">
              Support Duration
            </label>
            <select
              id="support"
              {...register('support')}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
            >
              <option value="none">No support</option>
              <option value="30-days">30 days</option>
              <option value="90-days">90 days</option>
              <option value="1-year">1 year</option>
            </select>
          </div>

          {/* Documentation */}
          <div>
            <label htmlFor="documentation" className="block text-sm font-semibold text-gray-900 dark:text-white">
              Documentation URL <span className="text-gray-500 text-sm font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              id="documentation"
              {...register('documentation')}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
              placeholder="https://docs.example.com"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-accent dark:hover:bg-accent/90"
            >
              {isSubmitting || createMutation.isPending ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Publishing Listing...
                </>
              ) : (
                'Publish Listing'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
