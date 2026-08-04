'use client';

import Link from 'next/link';
import { Car, DollarSign, Banknote } from 'lucide-react';
import { useGetMyVehicles } from '@/hooks/useDrivers';

export default function DriverMyVehiclesPage() {
  const { data: vehicles, isLoading, error } = useGetMyVehicles();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        <p className="mt-2 text-gray-600">Chargement des véhicules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Erreur lors du chargement des véhicules
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-amber-600 p-3 rounded-lg">
          <Car size={28} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Mes véhicules</h1>
      </div>

      {!vehicles || vehicles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12 text-center border border-gray-200">
          <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Car size={32} className="text-amber-600" />
          </div>
          <p className="text-gray-500 text-lg">Aucun véhicule assigné pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition border border-gray-100 overflow-hidden group"
            >
              {/* Header with icon */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-amber-600 p-2 rounded-lg mt-1">
                    <Car size={20} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-medium">Immatriculation</p>
                    <p className="text-lg sm:text-xl font-bold text-amber-600 break-words">
                      {vehicle.vehicle.plate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Marque</p>
                    <p className="font-semibold text-gray-800">{vehicle.vehicle.brand}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Modèle</p>
                    <p className="font-semibold text-gray-800">{vehicle.vehicle.model}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Couleur</p>
                  <p className="font-semibold text-gray-800">{vehicle.vehicle.color}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex gap-2">
                <Link
                  href={`/vehicles/${vehicle.vehicle.id}/revenues`}
                  className="flex-1 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded transition text-center flex items-center justify-center gap-1"
                >
                  <DollarSign size={14} />
                  Recettes
                </Link>
                <Link
                  href={`/vehicles/${vehicle.vehicle.id}/expenses`}
                  className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition text-center flex items-center justify-center gap-1"
                >
                  <Banknote size={14} />
                  Dépenses
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
