# KYC Verification System - Once & Done ✅

## Overview

**Old Way** ❌
```
Every transaction → Check KYC → If not verified → Block transaction
Every withdrawal → Check KYC → If not verified → Block withdrawal
Every subscription → Check KYC → If not verified → Block subscription
😞 Repetitive & frustrating
```

**New Way** ✅
```
Home Page → KYC Section → Verify Once
         ↓
User verified flag: true
         ↓
Can do ALL transactions instantly (Client pays, Dev withdraws, Dev subscribes)
😊 Smooth & seamless
```

---

## User Flow

```
┌─────────────────────────────────────┐
│        USER LOGS IN                 │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│      HOME PAGE LOADS                │
└─────────────────────────────────────┘
         ↓
    Check: user.kycVerified?
    ┌──────────────┬──────────────┐
    ↓              ↓
   YES            NO
    ↓              ↓
Dashboard    Show KYC Banner
Ready        "Complete KYC to unlock payments"
             ↓
          User clicks "Verify KYC"
             ↓
          KYC Modal opens
             ↓
      User submits documents
      1. Pan Card or Aadhar
      2. Selfie with document
      3. Address proof
             ↓
       Documents uploaded
             ↓
    Admin reviews (usually instant)
             ↓
       user.kycVerified = true
             ↓
      ✅ KYC Complete Banner
        "All transactions unlocked"
             ↓
    User can now:
    - Client: Fund milestones instantly
    - Dev: Withdraw money instantly
    - Dev: Buy subscription instantly
```

---

## Database Schema

### User Model Update
```javascript
{
  _id: ObjectId(),
  name: String,
  email: String,
  role: 'client' | 'developer' | 'admin',
  
  // KYC Fields (NEW)
  kyc: {
    status: 'pending' | 'submitted' | 'verified' | 'rejected',
    // pending: Not started
    // submitted: User submitted, waiting admin review
    // verified: ✅ Approved, can transact
    // rejected: ❌ Need to resubmit
    
    verifiedAt: Date,
    rejectionReason: String, // If rejected
    
    // Documents
    documents: {
      panCard: {
        fileName: String,
        url: String,
        verified: Boolean,
        uploadedAt: Date,
      },
      aadhar: {
        fileName: String,
        url: String,
        verified: Boolean,
        uploadedAt: Date,
      },
      selfie: {
        fileName: String,
        url: String,
        verified: Boolean,
        uploadedAt: Date,
      },
      addressProof: {
        fileName: String,
        url: String,
        verified: Boolean,
        uploadedAt: Date,
      },
    },
    
    // Personal Info (for verification)
    personalInfo: {
      fullName: String,
      dateOfBirth: Date,
      address: String,
      city: String,
      state: String,
      pinCode: String,
      phoneNumber: String,
    },
  },
  
  // Shorthand
  kycVerified: Boolean, // true if status === 'verified'
}
```

---

## Backend APIs

### 1. Start KYC Submission
```javascript
POST /api/kyc/start
Headers: { Authorization: Bearer token }

Response: {
  kycId: ObjectId(),
  status: 'pending',
  message: 'KYC submission started'
}
```

### 2. Submit KYC Documents
```javascript
POST /api/kyc/submit
Headers: { Authorization: Bearer token }
Content-Type: multipart/form-data

Body:
{
  fullName: "John Doe",
  dateOfBirth: "1995-05-15",
  address: "123 Main St",
  city: "Bangalore",
  state: "Karnataka",
  pinCode: "560001",
  phoneNumber: "9876543210",
  
  panCard: <file>,
  aadhar: <file>,
  selfie: <file>,
  addressProof: <file>,
}

Response:
{
  kycId: ObjectId(),
  status: 'submitted',
  message: 'KYC submitted for verification',
  estimatedReviewTime: '24 hours',
}
```

### 3. Get KYC Status
```javascript
GET /api/kyc/status
Headers: { Authorization: Bearer token }

Response:
{
  status: 'verified' | 'pending' | 'submitted' | 'rejected',
  kycVerified: true,
  verifiedAt: Date,
  rejectionReason: null,
  documents: {
    panCard: { verified: true, ... },
    aadhar: { verified: true, ... },
    selfie: { verified: true, ... },
    addressProof: { verified: true, ... },
  },
}
```

### 4. Admin: Review KYC
```javascript
POST /api/admin/kyc/:kycId/review
Headers: { Authorization: Bearer adminToken }

Body:
{
  status: 'verified' | 'rejected',
  rejectionReason: 'Invalid pan card' // Only if rejected
}

Response:
{
  kycId: ObjectId(),
  status: 'verified',
  message: 'KYC verified',
  user: { _id, name, kycVerified: true }
}
```

### 5. Admin: List Pending KYC
```javascript
GET /api/admin/kyc/pending
Headers: { Authorization: Bearer adminToken }

Query: ?limit=20&page=1

Response:
[
  {
    _id: ObjectId(),
    userId: ObjectId(),
    userName: "John Doe",
    email: "john@example.com",
    submittedat: Date,
    documents: { panCard: URL, aadhar: URL, selfie: URL, addressProof: URL },
    status: 'submitted',
  },
  ...
]
```

---

## Frontend Components

### 1. KYC Status Banner (Home Page)
```jsx
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export function KYCBanner({ kycStatus, onStartKYC }) {
  if (kycStatus === 'verified') {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <div>
          <p className="font-semibold text-green-900">✅ KYC Verified</p>
          <p className="text-sm text-green-800">You can now transact freely</p>
        </div>
      </div>
    )
  }

  if (kycStatus === 'submitted') {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        <div>
          <p className="font-semibold text-blue-900">KYC Under Review</p>
          <p className="text-sm text-blue-800">Admin will verify within 24 hours</p>
        </div>
      </div>
    )
  }

  if (kycStatus === 'rejected') {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
        <p className="font-semibold text-red-900 mb-2">❌ KYC Rejected</p>
        <p className="text-sm text-red-800 mb-3">
          Your KYC was not approved. Please submit again.
        </p>
        <button
          onClick={onStartKYC}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
        >
          Resubmit KYC
        </button>
      </div>
    )
  }

  // pending - not started
  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600" />
        <div>
          <p className="font-semibold text-amber-900">⚠️ KYC Required</p>
          <p className="text-sm text-amber-800">
            Complete KYC verification to unlock transactions
          </p>
        </div>
      </div>
      <button
        onClick={onStartKYC}
        className="px-6 py-2 bg-amber-600 text-white rounded-lg font-medium whitespace-nowrap hover:bg-amber-700"
      >
        Start KYC
      </button>
    </div>
  )
}
```

### 2. KYC Modal Component
```jsx
import { useState } from 'react'
import { X, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { showToast } from '@/lib/toast'

const kycSchema = z.object({
  fullName: z.string().min(3, 'Full name required'),
  dateOfBirth: z.string().refine((date) => {
    const age = new Date().getFullYear() - new Date(date).getFullYear()
    return age >= 18
  }, 'Must be 18 or older'),
  address: z.string().min(5, 'Address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pinCode: z.string().regex(/^\d{6}$/, 'Valid 6-digit PIN code required'),
  phoneNumber: z.string().regex(/^\d{10}$/, '10-digit phone number required'),
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

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(kycSchema),
  })

  const formData = watch()

  const handleFileUpload = async (field, file) => {
    if (!file) return

    setUploading((prev) => ({ ...prev, [field]: true }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', field)

      // Upload to cloud storage (Cloudinary or S3)
      const response = await fetch('/api/kyc/upload-document', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setDocuments((prev) => ({ ...prev, [field]: data.url }))
      showToast.success(`${field} uploaded successfully`)
    } catch (error) {
      showToast.error(`Failed to upload ${field}`)
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }))
    }
  }

  const onSubmit = async (personalInfo) => {
    if (!documents.panCard || !documents.aadhar || !documents.selfie || !documents.addressProof) {
      showToast.error('All documents are required')
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
        showToast.success('KYC submitted successfully! Admin will review within 24 hours.')
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        showToast.error(error.message || 'Failed to submit KYC')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-surface rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Complete KYC Verification
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          One-time verification to unlock all transaction features
        </p>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                s <= step ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Personal Information</h3>

              <input
                {...register('fullName')}
                placeholder="Full Name"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
              />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}

              <input
                {...register('dateOfBirth')}
                type="date"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
              />
              {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth.message}</p>}

              <input
                {...register('phoneNumber')}
                placeholder="Phone Number (10 digits)"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>}

              <input
                {...register('address')}
                placeholder="Street Address"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}

              <div className="grid grid-cols-2 gap-4">
                <input
                  {...register('city')}
                  placeholder="City"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                />
                {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}

                <input
                  {...register('state')}
                  placeholder="State"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                />
                {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
              </div>

              <input
                {...register('pinCode')}
                placeholder="PIN Code (6 digits)"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
              />
              {errors.pinCode && <p className="text-red-500 text-sm">{errors.pinCode.message}</p>}

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={Object.keys(errors).length > 0}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                Next: Upload Documents
              </button>
            </div>
          )}

          {/* Step 2: Document Upload */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Upload Documents</h3>

              {['panCard', 'aadhar', 'selfie', 'addressProof'].map((field) => (
                <div key={field} className="border-2 border-dashed rounded-lg p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    {documents[field] ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {field === 'panCard' && 'PAN Card'}
                      {field === 'aadhar' && 'Aadhar Card'}
                      {field === 'selfie' && 'Selfie with Document'}
                      {field === 'addressProof' && 'Address Proof (Utility Bill)'}
                    </span>
                    {uploading[field] && <Loader2 className="w-4 h-4 animate-spin" />}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(field, e.target.files[0])}
                      className="hidden"
                      disabled={uploading[field]}
                    />
                  </label>
                  {documents[field] && (
                    <p className="text-sm text-green-600 mt-2">✓ Uploaded</p>
                  )}
                </div>
              ))}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 border rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!documents.panCard || !documents.aadhar || !documents.selfie || !documents.addressProof}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  Review & Submit
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Review Your Information</h3>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {formData.fullName}</p>
                <p><span className="font-medium">DOB:</span> {formData.dateOfBirth}</p>
                <p><span className="font-medium">Phone:</span> {formData.phoneNumber}</p>
                <p><span className="font-medium">Address:</span> {formData.address}, {formData.city}, {formData.state} {formData.pinCode}</p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-300">
                  ✓ All documents uploaded and ready for verification
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 px-4 py-3 border rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit KYC'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
```

### 3. Home Page Integration
```jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { KYCBanner } from '@/components/kyc/KYCBanner'
import { KYCModal } from '@/components/kyc/KYCModal'

export default function Home() {
  const [showKYCModal, setShowKYCModal] = useState(false)

  const { data: user, refetch } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me')
      return res.json()
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* KYC Banner - Top Priority */}
        <div className="mb-8">
          <KYCBanner
            kycStatus={user?.kyc?.status}
            onStartKYC={() => setShowKYCModal(true)}
          />
        </div>

        {/* Rest of dashboard content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Stats, Projects, Earnings, etc. */}
        </div>

        {/* KYC Modal */}
        {showKYCModal && (
          <KYCModal
            onClose={() => setShowKYCModal(false)}
            onSuccess={() => refetch()}
          />
        )}
      </div>
    </div>
  )
}
```

---

## Backend Implementation

### KYC Controller
```javascript
const verifyKYC = asyncHandler(async (req, res) => {
  const { fullName, dateOfBirth, address, city, state, pinCode, phoneNumber, documents } = req.body

  // Validate
  if (!fullName || !dateOfBirth || !documents || Object.values(documents).some(d => !d)) {
    throw new ApiError(400, 'Missing required fields')
  }

  // Update user
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      kyc: {
        status: 'submitted',
        personalInfo: {
          fullName,
          dateOfBirth,
          address,
          city,
          state,
          pinCode,
          phoneNumber,
        },
        documents: {
          panCard: { url: documents.panCard, verified: false },
          aadhar: { url: documents.aadhar, verified: false },
          selfie: { url: documents.selfie, verified: false },
          addressProof: { url: documents.addressProof, verified: false },
        },
        submittedat: new Date(),
      },
    },
    { new: true }
  )

  res.json(new ApiResponse(200, user, 'KYC submitted for verification'))
})

const getKYCStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  res.json(new ApiResponse(200, {
    status: user.kyc?.status || 'pending',
    kycVerified: user.kycVerified,
    verifiedAt: user.kyc?.verifiedAt,
    documents: user.kyc?.documents,
  }))
})

// Admin endpoint
const approveKYC = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const { status, rejectionReason } = req.body

  if (status !== 'verified' && status !== 'rejected') {
    throw new ApiError(400, 'Invalid status')
  }

  const updateData = {
    'kyc.status': status,
  }

  if (status === 'verified') {
    updateData['kyc.verifiedAt'] = new Date()
    updateData.kycVerified = true
  } else if (status === 'rejected') {
    updateData['kyc.rejectionReason'] = rejectionReason
  }

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true })

  res.json(new ApiResponse(200, user, `KYC ${status}`))
})

module.exports = {
  verifyKYC,
  getKYCStatus,
  approveKYC,
}
```

### KYC Routes
```javascript
const express = require('express')
const kycController = require('../controllers/kyc.controller')
const { verifyJWT, requireRole } = require('../middleware/auth.middleware')

const router = express.Router()

// User routes
router.post('/submit', verifyJWT, kycController.verifyKYC)
router.get('/status', verifyJWT, kycController.getKYCStatus)

// Admin routes
router.post('/:userId/approve', verifyJWT, requireRole('admin'), kycController.approveKYC)
router.get('/pending', verifyJWT, requireRole('admin'), kycController.getPendingKYC)

module.exports = router
```

---

## Transaction Flow Updates

Now that KYC is ONE-TIME only:

### Milestone Payment
```javascript
// BEFORE (Check every time)
const fundMilestone = async (contractId) => {
  if (!user.kycVerified) throw error('KYC required')
  // ... proceed
}

// AFTER (Already verified once)
const fundMilestone = async (contractId) => {
  // KYC is already done, just proceed
  if (user.kyc.status !== 'verified') {
    throw error('KYC not verified')
  }
  // ... proceed
}
```

### Withdrawal
```javascript
// BEFORE (Check every time)
const createPayout = async (amount) => {
  if (!user.kycVerified) throw error('KYC required')
  // ... proceed
}

// AFTER (Already verified once)
const createPayout = async (amount) => {
  // KYC is already done
  if (user.kyc.status !== 'verified') {
    throw error('KYC not verified')
  }
  // ... proceed
}
```

### Subscription
```javascript
// Subscriptions DON'T need KYC
// Just deduct from bank directly
const upgradeSubscription = async (planId) => {
  // No KYC check needed
  // Process payment directly
}
```

---

## Benefits

✅ **Better UX**: Verify once, transact forever  
✅ **Lower friction**: No repeated KYC dialogs  
✅ **Faster transactions**: Instant processing (KYC already done)  
✅ **Admin friendly**: Clear verification status on user profile  
✅ **Scalable**: Easy to update/re-verify if needed  

---

## Implementation Checklist

- [ ] Update User model with KYC fields
- [ ] Create KYCBanner component
- [ ] Create KYCModal component
- [ ] Create KYC controller functions
- [ ] Create KYC routes
- [ ] Add KYC to Home page
- [ ] Update transaction flows (remove per-transaction checks)
- [ ] Create admin KYC review page
- [ ] Setup document storage (Cloudinary/S3)
- [ ] Add notifications for KYC approval/rejection
- [ ] Test end-to-end flow

---

## Admin KYC Review Dashboard

```jsx
// admin/KYCReview.jsx
export default function KYCReviewDashboard() {
  const { data: pendingKYCs } = useQuery({
    queryKey: ['pending-kyc'],
    queryFn: async () => {
      const res = await fetch('/api/admin/kyc/pending')
      return res.json()
    },
  })

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">KYC Verification Review</h2>
      
      {pendingKYCs?.map((kyc) => (
        <div key={kyc._id} className="p-6 border rounded-lg">
          <h3>{kyc.userName}</h3>
          <p className="text-sm text-gray-600">Submitted: {new Date(kyc.submittedat).toLocaleDateString()}</p>
          
          {/* Show documents for review */}
          <div className="grid grid-cols-4 gap-4 my-4">
            <img src={kyc.documents.panCard} alt="PAN" className="w-full h-32 object-cover rounded" />
            <img src={kyc.documents.aadhar} alt="Aadhar" className="w-full h-32 object-cover rounded" />
            <img src={kyc.documents.selfie} alt="Selfie" className="w-full h-32 object-cover rounded" />
            <img src={kyc.documents.addressProof} alt="Address" className="w-full h-32 object-cover rounded" />
          </div>

          <div className="flex gap-4">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg" onClick={() => approveKYC(kyc._id)}>
              ✓ Approve
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg" onClick={() => rejectKYC(kyc._id)}>
              ✗ Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## Summary

```
OLD FLOW:
User wants to transact
  ↓ (Every time)
Check KYC
  ↓ (Every time)
Block or proceed
  😞

NEW FLOW:
User logs in
  ↓ (Once)
Complete KYC on home page
  ↓ (Admin reviews ~instantly)
KYC status: verified
  ↓ (Forever)
All transactions: INSTANT & UNLIMITED
  ✅
```

Much better! 🚀
