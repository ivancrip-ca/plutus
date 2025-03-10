'use client'
import PublicRoute from '../../components/PublicRoute';

export default function RegisterLayout({ children }) {
  return (
    <PublicRoute>
      {children}
    </PublicRoute>
  );
}
