'use client'
import PublicRoute from '../../components/PublicRoute';

export default function ResetPasswordLayout({ children }) {
  return (
    <PublicRoute>
      {children}
    </PublicRoute>
  );
}