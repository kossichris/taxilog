'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user?.role === 'OWNER') {
      router.replace('/dashboard');
    } else if (user?.role === 'DRIVER') {
      router.replace('/driver');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}
