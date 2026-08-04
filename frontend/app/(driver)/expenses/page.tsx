'use client';

import Link from 'next/link';
import { Banknote, ArrowRight } from 'lucide-react';
import { useGetDriverPendingExpenses } from '@/hooks/useExpenses';

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  FUEL: { label: 'Carburant', icon: '⛽' },
  MAINTENANCE: { label: 'Maintenance', icon: '🔧' },
  INSURANCE: { label: 'Assurance', icon: '🛡️' },
  TOLL: { label: 'Péage', icon: '🛣️' },
  PARKING: { label: 'Parking', icon: '🅿️' },
  OTHER: { label: 'Autre', icon: '📌' },
};

export default function DriverExpensesPage() {
  const { data: expenses, isLoading } = useGetDriverPendingExpenses();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        <p className="mt-2 text-gray-600">Chargement des dépenses...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-red-600 p-3 rounded-lg">
          <Banknote size={28} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Dépenses à signer</h1>
      </div>

      {!expenses || expenses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12 text-center border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Banknote size={32} className="text-red-600" />
          </div>
          <p className="text-gray-500 text-lg">Aucune dépense à signer</p>
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense: any) => {
            const category = CATEGORY_LABELS[expense.category] || CATEGORY_LABELS.OTHER;
            return (
              <Link
                key={expense.id}
                href={`/expenses/${expense.id}/sign`}
                className="bg-white rounded-lg shadow hover:shadow-md transition border border-gray-200 p-4 flex items-center justify-between group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{category.label}</p>
                      <p className="text-xs text-gray-500">{expense.vehicle.plate}</p>
                    </div>
                  </div>
                  {expense.description && (
                    <p className="text-sm text-gray-600 ml-11">{expense.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(expense.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <p className="text-lg font-bold text-red-600">{expense.amount} F</p>
                  <ArrowRight size={20} className="text-gray-400 group-hover:text-red-600 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
