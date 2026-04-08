# Project Posting Limit Feature

## Overview
Developers can post a maximum of **2 projects** without a Pro subscription. To post more projects, they must upgrade to a Pro subscription plan.

## Implementation Details

### Backend Changes

**File:** `server/src/controllers/project.controller.js`

#### Added Import
```javascript
const Subscription = require('../models/subscription.model');
```

#### Added Limit Check in `createProject` Function
```javascript
// Check subscription and project limit
const userSubscription = await Subscription.findOne({
  userId: req.user._id,
  status: 'active',
});

// If user doesn't have an active subscription, check project limit (max 2 projects)
if (!userSubscription || (userSubscription && userSubscription.plan === 'free')) {
  const userProjectCount = await Project.countDocuments({ clientId: req.user._id });

  if (userProjectCount >= 2) {
    throw new ApiError(
      403,
      'You have reached the maximum limit of 2 projects. Upgrade to Pro subscription to post more projects.'
    );
  }
}
```

**Logic:**
1. Queries the Subscription model to check if user has an active subscription
2. If no active subscription exists OR subscription plan is 'free', enforces the 2-project limit
3. Counts existing projects for the user
4. Throws a 403 error if user has 2 or more projects

---

### Frontend Changes

**File:** `frontend/src/pages/projects/AddProject.jsx`

#### Added Imports
```javascript
import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react' // For warning icon
```

#### Added State Variables
```javascript
const [projectCount, setProjectCount] = useState(0)
const [isLimitReached, setIsLimitReached] = useState(false)
const [isCheckingLimit, setIsCheckingLimit] = useState(true)
```

#### Added useEffect Hook
```javascript
useEffect(() => {
  const checkLimit = async () => {
    try {
      const response = await projectAPI.checkProjectLimit()
      const count = response.pagination?.total || 0
      setProjectCount(count)
      
      // If user has 2 or more projects, limit is reached
      if (count >= 2) {
        setIsLimitReached(true)
      }
    } catch (error) {
      if (error.response?.status === 403) {
        setIsLimitReached(true)
        toast.error(error.response?.data?.message)
      }
    } finally {
      setIsCheckingLimit(false)
    }
  }

  if (user) {
    checkLimit()
  }
}, [user])
```

#### Added UI Elements

1. **Project Count Indicator** (in header)
   - Shows: "Projects created: X/2"
   - Color: Indigo background
   - Visible when limit check completes

2. **Limit Reached Alert**
   - Shows amber warning box if limit is reached
   - Explains the limit and subscription requirement
   - "Upgrade to Pro" button links to `/subscription`

3. **Form Disabled State**
   - Entire form is hidden and replaced with a message if limit is reached
   - Shows: "Cannot Create More Projects" message
   - "View Subscription Plans" button to upgrade

**File:** `frontend/src/api/project.api.js`

#### Added Function
```javascript
export const checkProjectLimit = async () => {
  const response = await axios.get(`/projects/my?page=1&limit=100`);
  return response;
};
```

---

## User Flow

### Scenario 1: User with 0-1 Projects
```
1. Visits /projects/add
2. Sees header: "Projects created: 1/2"
3. Can fill form and submit normally
```

### Scenario 2: User with 2 Projects (No Subscription)
```
1. Visits /projects/add
2. Sees header: "Projects created: 2/2"
3. Sees amber alert: "Project Limit Reached"
4. Form is completely hidden
5. Sees message: "Cannot Create More Projects"
6. Clicks "View Subscription Plans" to upgrade
```

### Scenario 3: User with Pro/Max Subscription
```
1. Visits /projects/add
2. Can create unlimited projects
3. No limit alerts shown
4. Header shows: "Projects created: X/2" (informational only)
```

---

## Subscription Plans

| Plan | Project Limit | Features |
|------|---------------|----------|
| Free | 2 projects | Basic features |
| Pro | Unlimited | Advanced features |
| Max | Unlimited | Premium features |

---

## API Responses

### Success: Project Created
```json
{
  "statusCode": 201,
  "data": { "project": {...} },
  "message": "Project created successfully"
}
```

### Error: Limit Reached (403)
```json
{
  "statusCode": 403,
  "data": null,
  "message": "You have reached the maximum limit of 2 projects. Upgrade to Pro subscription to post more projects."
}
```

---

## Database Queries

### Check User's Projects
```javascript
const userProjectCount = await Project.countDocuments({ 
  clientId: req.user._id 
});
```

### Check User's Subscription
```javascript
const userSubscription = await Subscription.findOne({
  userId: req.user._id,
  status: 'active',
});
```

---

## Testing Checklist

- [ ] User with 0 projects can create project
- [ ] User with 1 project can create another project
- [ ] User with 2 projects cannot create more (shows alert)
- [ ] Project count indicator shows correct number
- [ ] "Upgrade to Pro" button navigates to subscription page
- [ ] Pro subscription users can create unlimited projects
- [ ] Error messages display correctly
- [ ] Form is disabled when limit reached
- [ ] Works on mobile and desktop

---

## Error Handling

**Backend:**
- 400: Missing required fields
- 403: Project limit reached
- Other validation errors

**Frontend:**
- Toast notifications for errors
- Alert UI for limit warnings
- Loading state while checking limit
- Graceful error recovery

---

## Future Enhancements

1. Admin panel to adjust project limits per plan
2. Email notification when approaching limit
3. Analytics dashboard showing project attempts
4. Automatic upgrade prompts
5. One-time project extension tokens

---

## Related Files

- Backend Controller: `server/src/controllers/project.controller.js`
- Frontend Component: `frontend/src/pages/projects/AddProject.jsx`
- API Client: `frontend/src/api/project.api.js`
- Database Model: `server/src/models/project.model.js`
- Subscription Model: `server/src/models/subscription.model.js`
