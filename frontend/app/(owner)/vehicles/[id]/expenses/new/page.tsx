'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useCreateExpense } from '@/hooks/useExpenses';

const CATEGORIES = [
  { value: 'FUEL', label: 'Carburant ⛽' },
  { value: 'MAINTENANCE', label: 'Maintenance 🔧' },
  { value: 'INSURANCE', label: 'Assurance 🛡️' },
  { value: 'TOLL', label: 'Péage 🛣️' },
  { value: 'PARKING', label: 'Parking 🅿️' },
  { value: 'OTHER', label: 'Autre 📌' },
];

export default function NewExpensePage() {
  const { id } = useParams();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('FUEL');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const createMutation = useCreateExpense(id as string);

  const getDatesInRange = (start: string, end: string): Date[] => {
    const dates: Date[] = [];
    const currentDate = new Date(start);
    const endingDate = new Date(end);

    while (currentDate <= endingDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || !category || !startDate || !endDate) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('La date de fin doit être après la date de début');
      return;
    }

    try {
      const dates = getDatesInRange(startDate, endDate);
      for (const date of dates) {
        await createMutation.mutateAsync({
          amount: parseFloat(amount),
          description,
          category,
          date,
        });
      }
      router.push(`/vehicles/${id}/expenses`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    }
  };

  return (
    <div>
      {/* Back button */}
      <div className="mb-6">
        <Link href={`/vehicles/${id}/expenses`} className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition">
          <ArrowLeft size={20} />
          Retour aux dépenses
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 max-w-md mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200 p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-red-600 p-3 rounded-lg">
              <Plus size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-600">Nouvelle dépense</h1>
              <p className="text-sm text-gray-600 mt-1">Enregistrez les frais d'exploitation</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-gray-900"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant (F)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-gray-900 placeholder-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails de la dépense (optionnel)"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-gray-900 placeholder-gray-500 resize-none h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-gray-900"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            {createMutation.isPending ? 'Création en cours...' : 'Créer la dépense'}
          </button>
        </form>
      </div>
    </div>
  );
}
