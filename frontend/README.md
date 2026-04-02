# TechMates Frontend

A production-ready React frontend for TechMates - a dual-sided freelance + marketplace platform.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router v6** - Routing
- **TanStack Query v5** - Server state management
- **Zustand** - Client state management
- **React Hook Form + Zod** - Form handling
- **Socket.io-client** - Real-time features
- **Axios** - HTTP client
- **react-hot-toast** - Notifications

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):

```bash
VITE_API_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_
```

### Development

Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

## Project Structure

See the main README for complete folder structure. Key directories:

- `src/api/` - API integration files
- `src/components/` - Reusable React components
- `src/pages/` - Page components
- `src/hooks/` - Custom React hooks
- `src/store/` - Zustand stores
- `src/utils/` - Utility functions
- `src/routes/` - Routing configuration

## Features

### Phase 1: Foundation ✅
- Base setup with Vite, Tailwind, ShadcN/UI
- Zustand stores for auth, notifications, wishlist
- TanStack Query configuration
- Axios interceptors for JWT refresh
- Routing structure with protected routes
- Navbar and Footer components
- Home page with hero section

### Phase 2: Auth Flow (Coming)
- Login/Register forms
- Password reset flow
- Role-based registration

### Phase 3+: Full Features
- Service Exchange Market
- Project Marketplace
- Real-time Chat
- Payments & Subscriptions
- Admin Dashboard

## Development Guidelines

- **State Management**: Use TanStack Query for server data, Zustand for global state
- **Forms**: Always use React Hook Form + Zod
- **Components**: Keep components under 200 lines, extract if needed
- **Styling**: Tailwind utilities only, no inline styles
- **API Calls**: Only through /api folder files, using axios instance
- **Dark Mode**: All elements must support dark: variants

## API Integration

The backend API is at `http://localhost:3000/api/v1`

All API responses follow this format:
```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "pagination": {} // optional
}
```

**Important**: All amounts are in paise (₹1 = 100 paise). Always divide by 100 before display.

## Authentication

- Uses httpOnly cookies for session persistence
- Access token: 15 minutes (returned in response body)
- Refresh token: 7 days (httpOnly cookie)
- Automatic token refresh via axios interceptor

## License

Proprietary - TechMates
