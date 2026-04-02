# Mobile Responsive Implementation Guide

## Overview
All components in TechMates are built with mobile-first responsive design using Tailwind CSS breakpoints.

## Breakpoints Used

| Device | Breakpoint | Tailwind | Usage |
|--------|-----------|----------|-------|
| Mobile | < 640px | (no prefix) | Base styles |
| Tablet | 640px - 768px | `sm:` | Tablet optimization |
| Small Laptop | 768px - 1024px | `md:` | Primary breakpoint |
| Desktop | 1024px - 1280px | `lg:` | Desktop optimization |
| Large Desktop | > 1280px | `xl:` | Extra large screens |

## Key Mobile-Responsive Features

### 1. **Touch-Friendly Design**
- All buttons: minimum 44px height (WCAG standard)
- All inputs: minimum 44px height for easy tapping
- Increased padding on mobile for better spacing

```jsx
// Example: Touch-friendly button
<button className="px-4 py-2 md:py-2 min-h-[44px] md:min-h-[40px]">
  Action
</button>
```

### 2. **Responsive Grids**
- Mobile: 1 column
- Tablet (md): 2 columns
- Desktop (lg): 3-4 columns

```jsx
// Example: Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
```

### 3. **Responsive Typography**
- Mobile: Smaller fonts (base size)
- Desktop: Larger fonts for readability

```jsx
// Example: Responsive text sizes
<h1 className="text-xl md:text-2xl lg:text-3xl font-bold" />
<p className="text-sm md:text-base lg:text-lg" />
```

### 4. **Responsive Spacing**
- Mobile: Tighter spacing (p-3, gap-2)
- Desktop: More generous spacing (p-6, gap-6)

```jsx
// Example: Responsive padding
<div className="p-3 md:p-4 lg:p-6">
```

### 5. **Mobile-First Layouts**
- Stack vertically on mobile
- Switch to grid/flex on larger screens

```jsx
// Example: Stack to row layout
<div className="flex flex-col md:flex-row gap-3 md:gap-4">
```

### 6. **Hide/Show Components**
- Hide on mobile: `hidden md:flex`
- Show only on mobile: `sm:flex md:hidden`

```jsx
// Desktop only version
<div className="hidden md:block">Desktop content</div>

// Mobile only version
<div className="md:hidden">Mobile content</div>
```

### 7. **Responsive Images**
- Images scale responsively
- Different sizes for different screens

```jsx
// Example: Responsive image
<img 
  src={avatar} 
  className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full"
/>
```

## Components Optimized for Mobile

### ✅ Chat System
- Sidebar hides on mobile, shows on tablet+
- Messages stack properly on small screens
- Input area stays accessible at bottom
- Touch-friendly message bubbles

### ✅ Recommendations
- Single column on mobile
- 2 columns on tablet
- 3 columns on desktop
- Card text sizes adjust
- Skills pills wrap properly

### ✅ Skeletons & Empty States
- Responsive widths
- Proper spacing on all devices
- Icons scale with screen size

### ✅ Breadcrumb Navigation
- Responsive font sizes
- Hides unnecessary items on mobile
- Truncates long paths

### ✅ Help Button & Modals
- Bottom sheet on mobile
- Overlays on desktop
- Touch-friendly expand/collapse

### ✅ Badges & Verification
- Grid layout adjusts per screen
- Icons remain clickable on small screens
- Forms are mobile-optimized

### ✅ Reviews System
- Review cards stack on mobile
- Rating display scales responsively
- Review form inputs are touch-friendly

## Mobile Testing Checklist

- [ ] Test on iPhone SE (375px width)
- [ ] Test on iPhone 12 (390px width)
- [ ] Test on iPad (768px width)
- [ ] Test on Android phones (360-400px)
- [ ] Test landscape orientation
- [ ] Test with notch/safe areas
- [ ] Test touch interactions work
- [ ] Test form inputs are reachable
- [ ] Test modals don't overflow
- [ ] Test images load properly

## Utilities Available

Import from `@/lib/mobileResponsive.js`:

```javascript
// Responsive patterns
import { 
  responsive,      // fontSize, grid, padding options
  mobilePatterns,  // flex/grid conversions
  mobileButton,    // button size variants
  mobileInput,     // input styling variants
  mobileSheet,     // bottom sheet styles
  touchSizes,      // WCAG touch targets
} from '@/lib/mobileResponsive'
```

## Best Practices

1. **Mobile First**: Style mobile first, then add `md:`, `lg:` variants
2. **Touch Targets**: Never make buttons/inputs smaller than 44px on mobile
3. **Readable Text**: Use 16px+ on mobile for clickable elements
4. **Accessible Spacing**: More padding on mobile for easier tapping
5. **Full Width**: Forms and inputs should be full-width on mobile
6. **Scrollable Content**: Use vertical scrolling on mobile, not horizontal
7. **Reduced Motion**: Respect `prefers-reduced-motion` setting
8. **Safe Areas**: Account for notches on iPhone X+

## Common Issues Fixed

| Issue | Fix | Classes |
|-------|-----|---------|
| Text too small on mobile | Add size variants | `text-sm md:text-base` |
| Buttons too small to tap | Min height 44px | `min-h-[44px]` |
| Layout breaks on mobile | Use responsive grid | `grid-cols-1 md:grid-cols-2` |
| Images overflow | Use max-width | `w-full max-w-md` |
| Forms hard to use | Full width + larger inputs | `w-full min-h-[44px]` |
| Modals overflow screen | Use bottom sheet on mobile | `md:rounded-none rounded-t-2xl` |

## Performance Considerations

- Lazy load images: `loading="lazy"`
- Responsive images: Use `srcset`
- Minimize JavaScript on mobile
- Use native mobile controls
- Optimize font sizes for readability

## Accessibility on Mobile

- Ensure minimum 44x44px touch targets
- Use semantic HTML (button, input, etc.)
- Provide tap feedback (hover states work too)
- Don't rely on hover-only interactions
- Test with screen readers on mobile
- Ensure keyboard navigation works

---

**All TechMates components follow these mobile-responsive best practices for optimal user experience across all devices.**
