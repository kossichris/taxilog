'use client';

import { useState } from 'react';
import { Menu, X, LogOut, LayoutDashboard, Car } from 'lucide-react';
import Image from 'next/image';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-50 md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="w-10 h-10 rounded-lg overflow-hidden">
          <Image src="/taxilog-logo-simple.svg" alt="TaxiLog" width={40} height={40} priority />
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 active:bg-gray-200 transition"
          aria-label="Menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden bg-white border-b-2 border-amber-100 px-0 py-2 space-y-1 z-20">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-amber-50 active:bg-amber-100 border-l-4 border-transparent hover:border-amber-600 transition"
            onClick={() => setMenuOpen(false)}
          >
            <LayoutDashboard size={20} className="text-amber-600" />
            Dashboard
          </a>
          <a
            href="/vehicles"
            className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-amber-50 active:bg-amber-100 border-l-4 border-transparent hover:border-amber-600 transition"
            onClick={() => setMenuOpen(false)}
          >
            <Car size={20} className="text-amber-600" />
            Véhicules
          </a>
          <div className="border-t border-gray-200 my-2"></div>
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
            className="w-full flex items-center gap-3 text-left px-6 py-3 text-red-600 hover:bg-red-50 active:bg-red-100 border-l-4 border-transparent transition"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </nav>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <Image src="/taxilog-logo-simple.svg" alt="TaxiLog" width={48} height={48} priority />
            </div>
            <h1 className="text-2xl font-bold text-amber-600">TaxiLog</h1>
          </div>
          <p className="text-xs text-gray-500 mt-2">Propriétaire</p>
        </div>
        <nav className="mt-8 space-y-2 px-4 flex-1">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 rounded-lg transition"
          >
            <LayoutDashboard size={20} className="text-amber-600" />
            Dashboard
          </a>
          <a
            href="/vehicles"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 rounded-lg transition"
          >
            <Car size={20} className="text-amber-600" />
            Véhicules
          </a>
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-3 text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="hidden md:block bg-white shadow-sm px-8 py-4"></div>
        <div className="flex-1 overflow-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
