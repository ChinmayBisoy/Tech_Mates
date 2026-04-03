import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  Upload,
  ChevronRight,
  ChevronLeft,
  Loader,
  User,
  MapPin,
  Phone,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Shield,
  Zap,
} from 'lucide-react';
import kycApi from '../../api/kyc.api';

// Validation schemas for each step
const personalInfoSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: z.string().trim().min(1, 'Last name is required').min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().trim().min(1, 'Date of birth is required'),
  gender: z.string().trim().min(1, 'Please select a gender'),
  address: z.string().trim().min(1, 'Address is required').min(5, 'Please enter a valid address'),
  city: z.string().trim().min(1, 'City is required').min(2, 'City must be at least 2 characters'),
  state: z.string().trim().min(1, 'State is required').min(2, 'State must be at least 2 characters'),
  zipCode: z.string().trim().min(1, 'ZIP code is required'),
  phone: z.string().trim().min(1, 'Phone number is required').regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
});

const documentsSchema = z.object({
  pan: z.instanceof(File).optional(),
  aadhar: z.instanceof(File).optional(),
  selfie: z.instanceof(File).optional(),
  addressProof: z.instanceof(File).optional(),
});

const kycModalSchema = personalInfoSchema.merge(documentsSchema);

const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center gap-3 max-w-xs mx-auto">
    {[1, 2, 3].map((step, idx) => (
      <div key={step} className="flex items-center flex-1 justify-center">
        {/* Circle */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 shadow-md ${
              step < currentStep
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
                : step === currentStep
                ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white scale-100 shadow-lg'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            {step < currentStep ? (
              <CheckCircle2 size={18} />
            ) : (
              <span className="font-black">{step}</span>
            )}
          </div>
        </div>

        {/* Connector Line - Only between steps */}
        {step < totalSteps && (
          <div className="flex-1 h-1 mx-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                step < currentStep
                  ? 'bg-emerald-400'
                  : 'bg-gray-300'
              }`}
            />
          </div>
        )}
      </div>
    ))}
  </div>
);

const FormInput = ({ label, icon: Icon, error, ...props }) => {
  const hasError = error && error.length > 0;
  
  return (
    <div className="space-y-2.5">
      <label className="block text-sm font-semibold text-gray-900">{label}</label>
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" size={20} />
        )}
        <input
          {...props}
          className={`w-full transition-all duration-300 ${
            Icon ? 'pl-12' : 'px-4'
          } py-3.5 bg-white border-2 rounded-xl focus:outline-none font-medium ${
            hasError
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50'
              : 'border-gray-300 group-focus-within:border-blue-500 group-hover:border-gray-400 focus:ring-2 focus:ring-blue-100'
          }`}
        />
      </div>
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-2 font-medium">
          <AlertCircle size={16} /> {error}
        </p>
      )}
    </div>
  );
};

const KYCModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [documents, setDocuments] = useState({});
  const [uploading, setUploading] = useState({});
  const [documentUrls, setDocumentUrls] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    trigger,
    clearErrors,
    reset,
  } = useForm({
    resolver: zodResolver(personalInfoSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
    },
  });

  const formData = watch();

  const handleDocumentChange = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError(`${docType} file size must not exceed 5MB`);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype || file.type)) {
      setError('Only JPEG, JPG, and PNG images are allowed');
      return;
    }

    setUploading((prev) => ({ ...prev, [docType]: true }));
    setError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('document', file);
      formDataUpload.append('documentType', docType);

      const response = await kycApi.uploadDocument(formDataUpload);

      setDocumentUrls((prev) => ({
        ...prev,
        [docType]: response.data.documentUrl,
      }));

      setDocuments((prev) => ({
        ...prev,
        [docType]: file,
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading((prev) => ({ ...prev, [docType]: false }));
    }
  };

  const onSubmit = async (data) => {
    if (step === 1) {
      // Clear any previous errors
      clearErrors();
      
      // Validate all fields
      const isValid = await trigger();
      
      if (isValid) {
        setError('');
        setStep(2);
      } else {
        setError('Please fill in all required fields correctly');
      }
      return;
    }

    if (step === 2) {
      if (!documentUrls.pan || !documentUrls.aadhar || !documentUrls.selfie || !documentUrls.addressProof) {
        setError('All documents (PAN, Aadhar, Selfie, Address Proof) are required');
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      setLoading(true);
      setError('');

      try {
        const payload = {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          phone: data.phone,
        };

        await kycApi.submitKYC(payload);
        onSuccess?.();
        onClose();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to submit KYC');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleButtonClick = async () => {
    // For step 1, we need to manually submit and validate
    if (step === 1) {
      await handleSubmit(onSubmit)();
    } else {
      // For other steps, use handleSubmit
      await handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-slate-950/90 flex items-center justify-center z-50 p-4 backdrop-blur-2xl">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-gray-100 group relative">
        {/* Glow effect around modal */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl opacity-20 blur-2xl -z-10 group-hover:opacity-30 transition-opacity duration-500"></div>
        
        {/* Premium Animated Header - FULL BLUE SECTION */}
        <div className="sticky top-0 z-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden relative">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative z-10 px-8 py-8">
            {/* Top Bar: Badge + Close Button */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/40">
                  <Shield size={24} className="text-cyan-200 animate-pulse" />
                </div>
                <div className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-xs font-black backdrop-blur-xl border border-white/30 tracking-wide">
                  ⚡ INSTANT VERIFICATION
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-all duration-300 p-2.5 hover:bg-white/20 rounded-lg flex-shrink-0 group/close hover:scale-110"
              >
                <X size={28} className="group-hover/close:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Main Title - Fully Visible */}
            <h2 className="text-6xl font-black text-white drop-shadow-xl mb-10 leading-tight">KYC Verification</h2>

            {/* Progress Bar Section */}
            <div className="space-y-4 mb-10">
              <div className="flex items-center justify-between">
                <span className="text-blue-100 font-bold text-xs tracking-widest">COMPLETION PROGRESS</span>
                <div className="text-white font-black text-sm bg-white/15 px-4 py-1.5 rounded-full backdrop-blur-xl border border-white/30">{step} of 3</div>
              </div>
              <div className="h-3 bg-white/25 rounded-full overflow-hidden backdrop-blur-xl border border-white/30">
                <div
                  className="h-full bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 rounded-full transition-all duration-700 ease-out shadow-lg shadow-blue-400/60"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Indicator - INSIDE BLUE HEADER */}
            <div className="pt-6 border-t border-white/20">
              <StepIndicator currentStep={step} totalSteps={3} />
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="px-8 py-8 space-y-8">
            {error && (
              <div className="bg-gradient-to-r from-red-100 to-red-200 border-2 border-red-400 p-5 rounded-xl flex gap-4 animate-slideIn shadow-xl shadow-red-300/50">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5 animate-bounce" size={28} />
                <div className="flex-1">
                  <p className="text-red-900 font-black text-base">⚠️ Error</p>
                  <p className="text-red-800 text-sm mt-1 font-semibold">{error}</p>
                </div>
              </div>
            )}

            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-8 animate-fadeIn">
                <div className="group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-300/50 group-hover:shadow-2xl group-hover:shadow-blue-400/50 transition-shadow group-hover:scale-110">
                      <User size={28} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-gray-900">Personal Information</h3>
                      <p className="text-gray-600 text-sm font-bold mt-1">📝 Step 1 of 3 • Enter your basic details</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-300 rounded-xl p-6 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-blue-500 text-white">
                      <Zap size={22} />
                    </div>
                    <div className="text-sm text-blue-900 flex-1">
                      <p className="font-black text-base">🔐 Quick & Secure</p>
                      <p className="text-blue-800 mt-2 font-semibold">Your information is encrypted with military-grade security and stored privately on our servers.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormInput
                    label="First Name"
                    icon={User}
                    {...register('firstName')}
                    placeholder="John"
                    error={errors.firstName?.message}
                  />
                  <FormInput
                    label="Last Name"
                    icon={User}
                    {...register('lastName')}
                    placeholder="Doe"
                    error={errors.lastName?.message}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormInput
                    label="Date of Birth"
                    icon={Calendar}
                    {...register('dateOfBirth')}
                    type="date"
                    error={errors.dateOfBirth?.message}
                  />
                  <div className="space-y-2.5">
                    <label className="block text-sm font-bold text-gray-900">Gender</label>
                    <select
                      {...register('gender')}
                      className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all duration-300 focus:outline-none font-medium ${
                        errors.gender
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-sm text-red-600 flex items-center gap-2 font-medium">
                        <AlertCircle size={16} /> {errors.gender.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-sm font-semibold text-gray-900">Full Address</label>
                  <textarea
                    {...register('address')}
                    placeholder="123 Street Name, Apartment/Suite"
                    rows="3"
                    className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all duration-300 focus:outline-none resize-none font-medium ${
                      errors.address
                        ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600 flex items-center gap-2 font-medium">
                      <AlertCircle size={16} /> {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <FormInput
                    label="City"
                    icon={MapPin}
                    {...register('city')}
                    placeholder="Mumbai"
                    error={errors.city?.message}
                  />
                  <FormInput
                    label="State"
                    icon={MapPin}
                    {...register('state')}
                    placeholder="MH"
                    error={errors.state?.message}
                  />
                  <FormInput
                    label="ZIP Code"
                    icon={MapPin}
                    {...register('zipCode')}
                    placeholder="400001"
                    error={errors.zipCode?.message}
                  />
                </div>

                <FormInput
                  label="Phone Number"
                  icon={Phone}
                  {...register('phone')}
                  type="tel"
                  placeholder="9876543210"
                  error={errors.phone?.message}
                />
              </div>
            )}

            {/* Step 2: Document Upload */}
            {step === 2 && (
              <div className="space-y-8 animate-fadeIn">
                <div className="group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-300/50 group-hover:shadow-2xl group-hover:shadow-emerald-400/50 transition-shadow group-hover:scale-110">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-gray-900">Upload Documents</h3>
                      <p className="text-gray-600 text-sm font-bold mt-1">🚀 Step 2 of 3 • All files are encrypted</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 border-2 border-emerald-300 rounded-xl p-6 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-emerald-500 text-white">
                      <CheckCircle2 size={22} />
                    </div>
                    <div className="text-sm text-emerald-900 flex-1">
                      <p className="font-black text-base">🔒 Secure Upload</p>
                      <p className="text-emerald-800 mt-2 font-semibold">Your documents are encrypted with military-grade security and stored privately on our servers.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {['pan', 'aadhar', 'selfie', 'addressProof'].map((docType) => (
                    <div key={docType} className="group/doc">
                      <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-lg">
                          {docType === 'pan' && '🔐'}
                          {docType === 'aadhar' && '🪪'}
                          {docType === 'selfie' && '📸'}
                          {docType === 'addressProof' && '📄'}
                        </span>
                        {docType === 'pan' && 'PAN Card'}
                        {docType === 'aadhar' && 'Aadhar Card'}
                        {docType === 'selfie' && 'Selfie'}
                        {docType === 'addressProof' && 'Address Proof'}
                        <span className="text-red-500 font-bold">*</span>
                      </label>

                      <div
                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                          documentUrls[docType]
                            ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100/50'
                            : 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 group-hover/doc:border-blue-400 group-hover/doc:from-blue-50 group-hover/doc:to-blue-100 transform transition-transform group-hover/doc:scale-[1.02]'
                        }`}
                        onClick={() => !uploading[docType] && document.getElementById(`${docType}-input`)?.click()}
                      >
                        {documentUrls[docType] ? (
                          <div className="space-y-4 py-4">
                            <div className="flex justify-center">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                                <CheckCircle2 size={32} className="text-white animate-pulse" />
                              </div>
                            </div>
                            <div>
                              <p className="font-bold text-emerald-700 text-lg">Upload Successful! ✓</p>
                              <p className="text-sm text-gray-600 mt-2 truncate">{documents[docType]?.name}</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDocumentUrls((prev) => {
                                  const { [docType]: _, ...rest } = prev;
                                  return rest;
                                });
                                setDocuments((prev) => {
                                  const { [docType]: _, ...rest } = prev;
                                  return rest;
                                });
                              }}
                              className="text-sm px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all font-semibold"
                            >
                              Change
                            </button>
                          </div>
                        ) : uploading[docType] ? (
                          <div className="flex flex-col items-center justify-center space-y-4 py-6">
                            <div className="relative">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                <Loader size={28} className="animate-spin text-blue-600" />
                              </div>
                            </div>
                            <span className="text-gray-700 font-bold">Uploading...</span>
                            <p className="text-xs text-gray-600">Please don't close this window</p>
                          </div>
                        ) : (
                          <div className="space-y-4 py-4">
                            <div className="flex justify-center">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                <Upload size={32} className="text-gray-600" />
                              </div>
                            </div>
                            <div>
                              <p className="font-bold text-gray-700 text-lg">Click to upload</p>
                              <p className="text-xs text-gray-600 mt-1">PNG, JPG, JPEG up to 5MB</p>
                            </div>
                          </div>
                        )}

                        <input
                          id={`${docType}-input`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleDocumentChange(e, docType)}
                          className="hidden"
                          disabled={uploading[docType]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Review & Confirm */}
            {step === 3 && (
              <div className="space-y-8 animate-fadeIn">
                <div className="group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 via-pink-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-purple-300/50 group-hover:shadow-2xl group-hover:shadow-purple-400/50 transition-shadow group-hover:scale-110">
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-gray-900">Review & Confirm</h3>
                      <p className="text-gray-600 text-sm font-bold mt-1">✨ Step 3 of 3 • Final verification step</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-purple-900">
                      <p className="font-bold">You're Almost Done!</p>
                      <p className="text-purple-800 mt-1">Review your information below and confirm to complete verification. You'll receive a confirmation email shortly.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900">Personal Information</h4>
                  <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-100 rounded-xl p-6 space-y-3">
                    {[
                      { label: 'Full Name', value: `${formData.firstName} ${formData.lastName}`, icon: '👤' },
                      { label: 'Date of Birth', value: formData.dateOfBirth, icon: '📅' },
                      { label: 'Gender', value: formData.gender?.charAt(0).toUpperCase() + formData.gender?.slice(1), icon: '✨' },
                      { label: 'Address', value: formData.address, icon: '📍' },
                      { label: 'City, State, ZIP', value: `${formData.city}, ${formData.state} ${formData.zipCode}`, icon: '🏙️' },
                      { label: 'Phone Number', value: formData.phone, icon: '📞' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3 px-4 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-gray-700 font-semibold text-sm">{item.label}</span>
                        </div>
                        <span className="text-gray-900 font-bold text-right break-words ml-4">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900">Uploaded Documents</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {['pan', 'aadhar', 'selfie', 'addressProof'].map((docType) => (
                      <div
                        key={docType}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          documentUrls[docType]
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="text-2xl mb-2">
                          {docType === 'pan' && '🔐'}
                          {docType === 'aadhar' && '🪪'}
                          {docType === 'selfie' && '📸'}
                          {docType === 'addressProof' && '📄'}
                        </div>
                        <p className="text-xs font-bold text-gray-700 mb-2 capitalize">
                          {docType === 'pan' && 'PAN Card'}
                          {docType === 'aadhar' && 'Aadhar Card'}
                          {docType === 'selfie' && 'Selfie'}
                          {docType === 'addressProof' && 'Address Proof'}
                        </p>
                        <p className={`text-xs font-bold ${documentUrls[docType] ? 'text-emerald-600' : 'text-red-600'}`}>
                          {documentUrls[docType] ? '✓ Uploaded' : '✗ Missing'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 border-2 border-blue-400 rounded-xl p-7 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <CheckCircle2 size={32} className="text-blue-600 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-blue-900 text-lg">✅ Verification Complete</p>
                      <p className="text-blue-800 mt-3 leading-relaxed font-semibold">By confirming, you certify that the information you provided is accurate and truthful. Your information is protected by encryption and our privacy policy. You'll receive a confirmation email shortly.</p>
                      <div className="mt-4 p-3 bg-white/80 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-900 font-semibold">🎯 Next Steps: After verification, you'll get instant access to all platform features including withdrawal, contracts, and more.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Premium Footer - Sticky Bottom */}
        <div className="sticky bottom-0 border-t-2 border-gray-300 bg-gradient-to-r from-gray-900/5 via-blue-50/50 to-indigo-50/50 p-6 flex gap-4 shadow-2xl backdrop-blur-sm">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
            className="flex items-center justify-center gap-2 px-7 py-4 text-gray-800 border-2 border-gray-400 rounded-xl hover:border-gray-600 hover:bg-white transition-all duration-300 font-bold group shadow-md hover:shadow-lg hover:scale-105 active:scale-100"
          >
            <ChevronLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          <button
            type="button"
            onClick={handleButtonClick}
            disabled={loading}
            className="ml-auto flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-xl hover:shadow-2xl hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 active:scale-95 transition-all duration-300 font-bold disabled:opacity-60 disabled:cursor-not-allowed group shadow-lg hover:scale-105 hover:-translate-y-1"
          >
            {loading ? (
              <>
                <Loader size={22} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {step === 3 ? (
                  <>
                    <CheckCircle2 size={22} className="animate-pulse" />
                    <span>Complete Verification</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ChevronRight size={22} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default KYCModal;
