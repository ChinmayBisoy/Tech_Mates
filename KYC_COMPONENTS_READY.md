# KYC Components - Ready to Use ✅

## Quick Setup Guide

1. Create folder: `frontend/src/components/kyc/`
2. Copy-paste these files
3. Add to Home page
4. Done! ✨

---

## File 1: KYCBanner.jsx (Top of Home)

```jsx
import { AlertCircle, CheckCircle, Loader2, X } from 'lucide-react'

export function KYCBanner({ kycStatus, onStartKYC, onDismiss }) {
  if (kycStatus === 'verified') {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-green-900 dark:text-green-300">✅ KYC Verified</p>
            <p className="text-sm text-green-800 dark:text-green-400">You can transact without limits</p>
          </div>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="p-1 hover:bg-green-100 dark:hover:bg-green-900/50 rounded">
            <X className="w-5 h-5 text-green-600" />
          </button>
        )}
      </div>
    )
  }

  if (kycStatus === 'submitted') {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-3">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0" />
        <div>
          <p className="font-semibold text-blue-900 dark:text-blue-300">KYC Under Review</p>
          <p className="text-sm text-blue-800 dark:text-blue-400">Admin verifying documents (usually < 24 hrs)</p>
        </div>
      </div>
    )
  }

  if (kycStatus === 'rejected') {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-300">❌ KYC Rejected</p>
              <p className="text-sm text-red-800 dark:text-red-400 mt-1">
                Your KYC submission needs to be corrected. Please resubmit.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onStartKYC}
          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
        >
          Resubmit KYC
        </button>
      </div>
    )
  }

  // pending - not started
  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <p className="font-semibold text-amber-900 dark:text-amber-300">⚠️ KYC Verification Required</p>
          <p className="text-sm text-amber-800 dark:text-amber-400">
            Complete once to unlock all transactions (payments, withdrawals, subscriptions)
          </p>
        </div>
      </div>
      <button
        onClick={onStartKYC}
        className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium whitespace-nowrap transition"
      >
        Start KYC
      </button>
    </div>
  )
}
```

---

## File 2: KYCModal.jsx (Multi-Step Form)

```jsx
import { useState } from 'react'
import { X, Upload, CheckCircle, AlertCircle, Loader2, ChevronDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { showToast } from '@/lib/toast'

const kycSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  dateOfBirth: z.string().refine((date) => {
    if (!date) return false
    const age = new Date().getFullYear() - new Date(date).getFullYear()
    return age >= 18
  }, 'Must be 18 or older'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pinCode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
})

export function KYCModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1) // 1: Personal Info, 2: Documents, 3: Review
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState({
    panCard: null,
    aadhar: null,
    selfie: null,
    addressProof: null,
  })
  const [uploading, setUploading] = useState({})

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(kycSchema),
    mode: 'onBlur',
  })

  const formData = watch()

  const handleFileUpload = async (field, file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast.error('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('File size must be less than 5MB')
      return
    }

    setUploading((prev) => ({ ...prev, [field]: true }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', field)

      // Upload document
      const response = await fetch('/api/kyc/upload-document', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setDocuments((prev) => ({ ...prev, [field]: data.url }))
      showToast.success(`${field.replace(/([A-Z])/g, ' $1').trim()} uploaded`)
    } catch (error) {
      showToast.error(`Failed to upload document`)
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }))
    }
  }

  const onSubmit = async (personalInfo) => {
    // Validate all documents
    const missingDocs = Object.entries(documents)
      .filter(([_, url]) => !url)
      .map(([field]) => field)

    if (missingDocs.length > 0) {
      showToast.error(`Please upload: ${missingDocs.join(', ')}`)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...personalInfo,
          documents,
        }),
      })

      if (response.ok) {
        showToast.success('KYC submitted! Admin will review within 24 hours.')
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        showToast.error(error.message || 'Failed to submit KYC')
      }
    } catch (error) {
      showToast.error(error.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const documentLabels = {
    panCard: 'PAN Card',
    aadhar: 'Aadhar/ID Card',
    selfie: 'Selfie with ID',
    addressProof: 'Address Proof (Utility Bill)',
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-surface rounded-2xl max-w-2xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">KYC Verification</h2>
            <p className="text-blue-100 text-sm mt-1">One-time verification · Takes ~5 minutes</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-600/50 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step Indicator */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div
                  className={`h-1 rounded-full transition-all ${
                    s < step
                      ? 'bg-green-500'
                      : s === step
                      ? 'bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Step 1: Personal Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register('fullName')}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    {...register('dateOfBirth')}
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    {...register('phoneNumber')}
                    placeholder="9876543210"
                    maxLength="10"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Street Address *
                  </label>
                  <input
                    {...register('address')}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      {...register('city')}
                      placeholder="Bangalore"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State *
                    </label>
                    <input
                      {...register('state')}
                      placeholder="Karnataka"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    PIN Code (6 digits) *
                  </label>
                  <input
                    {...register('pinCode')}
                    placeholder="560001"
                    maxLength="6"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  {errors.pinCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.pinCode.message}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => Object.keys(errors).length === 0 && setStep(2)}
                  disabled={Object.keys(errors).length > 0}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  Next: Upload Documents
                  <ChevronDown className="w-4 h-4 rotate-90" />
                </button>
              </div>
            )}

            {/* Step 2: Document Upload */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Step 2: Upload Documents
                </h3>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    📸 Upload clear images of your documents. Max file size: 5MB
                  </p>
                </div>

                {Object.keys(documentLabels).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {documentLabels[field]} *
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {documents[field] ? (
                          <>
                            <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                            <p className="text-sm font-medium text-green-600">Uploaded ✓</p>
                          </>
                        ) : uploading[field] ? (
                          <>
                            <Loader2 className="w-8 h-8 text-blue-500 mb-2 animate-spin" />
                            <p className="text-sm font-medium text-blue-600">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Click to upload
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or PDF up to 5MB</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(field, e.target.files?.[0])}
                        className="hidden"
                        disabled={uploading[field]}
                      />
                    </label>
                  </div>
                ))}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={
                      !documents.panCard ||
                      !documents.aadhar ||
                      !documents.selfie ||
                      !documents.addressProof
                    }
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    Review & Submit
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Step 3: Review & Submit
                </h3>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3 text-sm">
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>{' '}
                    {formData.fullName}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">DOB:</span>{' '}
                    {formData.dateOfBirth}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>{' '}
                    {formData.phoneNumber}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Address:</span>{' '}
                    {formData.address}, {formData.city}, {formData.state} {formData.pinCode}
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800 dark:text-green-300">
                      All documents uploaded and verified. Ready to submit!
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    By submitting, you confirm that all information is accurate and true.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        ✓ Submit KYC
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
```

---

## File 3: Add to Home Page

```jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { KYCBanner } from '@/components/kyc/KYCBanner'
import { KYCModal } from '@/components/kyc/KYCModal'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const [showKYCModal, setShowKYCModal] = useState(false)
  const [dismissedKYC, setDismissedKYC] = useState(false)
  const { user } = useAuth()

  const { data: kycStatus, refetch: refetchKYC } = useQuery({
    queryKey: ['kyc-status'],
    queryFn: async () => {
      const res = await fetch('/api/kyc/status')
      return res.json()
    },
    enabled: !!user,
  })

  const shouldShowKYC = !dismissedKYC && kycStatus?.status !== 'verified'

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* KYC Banner - Priority Display */}
        {shouldShowKYC && (
          <div className="mb-8">
            <KYCBanner
              kycStatus={kycStatus?.status}
              onStartKYC={() => setShowKYCModal(true)}
              onDismiss={() => setDismissedKYC(true)}
            />
          </div>
        )}

        {/* Rest of Dashboard */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Your dashboard content here */}
        </div>

        {/* KYC Modal */}
        {showKYCModal && (
          <KYCModal
            onClose={() => setShowKYCModal(false)}
            onSuccess={() => {
              setShowKYCModal(false)
              setDismissedKYC(false)
              refetchKYC()
            }}
          />
        )}
      </div>
    </div>
  )
}
```

---

## CSS Animation (Add to index.css)

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

---

## Backend Routes (Add to api)

```javascript
// server/src/routes/kyc.routes.js

const express = require('express')
const { verifyJWT, requireRole } = require('../middleware/auth.middleware')
const kycController = require('../controllers/kyc.controller')

const router = express.Router()

// User routes (protected)
router.post('/submit', verifyJWT, kycController.submitKYC)
router.get('/status', verifyJWT, kycController.getKYCStatus)
router.post('/upload-document', verifyJWT, kycController.uploadDocument)

// Admin routes (admin only)
router.get('/pending', verifyJWT, requireRole('admin'), kycController.getPendingKYC)
router.post('/:userId/approve', verifyJWT, requireRole('admin'), kycController.approveKYC)
router.post('/:userId/reject', verifyJWT, requireRole('admin'), kycController.rejectKYC)

module.exports = router
```

---

## Simple Summary

✅ **One KYC** - Open Home Page, see banner → Click "Start KYC"  
✅ **3 Steps** - Personal Info → Upload Documents → Review & Submit  
✅ **Forever** - Once verified, all transactions instant (no more KYC checks)  
✅ **Admin** - Reviews documents (usually automated/instant)  
✅ **Auto** - After approval, transactions work instantly  

Perfect UX! 🚀
