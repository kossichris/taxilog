'use client';

import Link from 'next/link';
import { Car, DollarSign, TrendingUp, Banknote } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useGetMyVehicles } from '@/hooks/useDrivers';

export default function DriverHomePage() {
  const user = useAuthStore((state) => state.user);
  const { data: vehicles, isLoading } = useGetMyVehicles();

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-lg border border-amber-200 p-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">Bienvenue, {user?.name} 👋</h1>
        <p className="text-gray-600 text-lg">Suivi des recettes et dépenses de vos véhicules</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6 hover:shadow-xl transition">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Recettes</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">0 F</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <DollarSign size={24} className="text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6 hover:shadow-xl transition">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Dépenses</p>
              <p className="text-3xl font-bold text-red-600 mt-2">0 F</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Banknote size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6 hover:shadow-xl transition">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Bénéfice Net</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">0 F</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <TrendingUp size={24} className="text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* My Vehicles */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 p-6 flex items-center gap-4">
          <div className="bg-amber-600 p-3 rounded-lg">
            <Car size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Mes véhicules</h2>
            <p className="text-sm text-gray-600">Accédez à vos véhicules assignés</p>
          </div>
        </div>

        <div className="p-8">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          ) : !vehicles || vehicles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun véhicule assigné pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicles.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/vehicles/${item.vehicle.id}/revenues`}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{item.vehicle.plate}</p>
                    <p className="text-sm text-gray-600">
                      {item.vehicle.brand} {item.vehicle.model}
                    </p>
                  </div>
                  <div className="text-amber-600">→</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Actions rapides</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/vehicles"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition text-center"
          >
            Voir tous les véhicules
          </Link>
        </div>
      </div>
    </div>
  );
}
