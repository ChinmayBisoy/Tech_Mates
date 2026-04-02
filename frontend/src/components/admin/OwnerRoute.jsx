import { Navigate } from 'react-router-dom';
import useOwnerStore from '@/store/ownerStore';

export default function OwnerRoute({ children }) {
  const isOwnerLoggedIn = useOwnerStore((state) => state.isOwnerLoggedIn);

  if (!isOwnerLoggedIn) {
    return <Navigate to="/owner-login" replace />;
  }

  return children;
}
