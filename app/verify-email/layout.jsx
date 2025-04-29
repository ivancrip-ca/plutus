'use client'
import PublicRoute from '../../components/PublicRoute';

export default function VerifyEmailLayout({ children }) {
  return (
    <PublicRoute>
      {children}
    </PublicRoute>
  );
}