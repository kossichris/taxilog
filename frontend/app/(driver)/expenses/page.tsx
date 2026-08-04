'use client';

import Link from 'next/link';
import { Banknote, Car } from 'lucide-react';
import { useGetMyVehicles } from '@/hooks/useDrivers';

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  FUEL: { label: 'Carburant', icon: '⛽' },
  MAINTENANCE: { label: 'Maintenance', icon: '🔧' },
  INSURANCE: { label: 'Assurance', icon: '🛡️' },
  TOLL: { label: 'Péage', icon: '🛣️' },
  PARKING: { label: 'Parking', icon: '🅿️' },
  OTHER: { label: 'Autre', icon: '📌' },
};

export default function DriverExpensesPage() {
  const { data: vehicles, isLoading } = useGetMyVehicles();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        <p className="mt-2 text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-red-600 p-3 rounded-lg">
          <Banknote size={28} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Dépenses</h1>
      </div>

      {!vehicles || vehicles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12 text-center border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Banknote size={32} className="text-red-600" />
          </div>
          <p className="text-gray-500 text-lg">Aucun véhicule assigné</p>
        </div>
      ) : (
        <div className="space-y-6">
          {vehicles.map((item) => (
            <Link
              key={item.id}
              href={`/vehicles/${item.vehicle.id}/expenses`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition border border-gray-100 overflow-hidden group"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-red-600 p-2 rounded-lg mt-1">
                    <Car size={20} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-medium">Immatriculation</p>
                    <p className="text-lg sm:text-xl font-bold text-red-600 break-words">
                      {item.vehicle.plate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Marque</p>
                    <p className="font-semibold text-gray-800">{item.vehicle.brand}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Modèle</p>
                    <p className="font-semibold text-gray-800">{item.vehicle.model}</p>
                  </div>
                </div>
                <p className="text-xs text-amber-600 font-medium">
                  Cliquez pour voir les dépenses →
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
