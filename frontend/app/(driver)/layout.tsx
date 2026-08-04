'use client';

import Image from 'next/image';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden">
            <Image src="/taxilog-logo-simple.svg" alt="TaxiLog" width={40} height={40} priority />
          </div>
          <h1 className="text-2xl font-bold text-amber-600">TaxiLog</h1>
        </div>
        <button
          onClick={() => {
            // Clear localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('userRole');

            // Clear cookies
            document.cookie = 'access_token=; path=/; max-age=0';
            document.cookie = 'userRole=; path=/; max-age=0';

            // Redirect
            setTimeout(() => {
              window.location.href = '/login';
            }, 100);
          }}
          className="text-sm text-gray-600 hover:text-red-600"
        >
          Déconnexion
        </button>
      </header>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
