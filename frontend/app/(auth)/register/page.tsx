'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/v1/auth/register', {
        name,
        phone,
        password,
      });

      const { access_token, refresh_token, user } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setUser(user);

      router.push('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 rounded-lg overflow-hidden">
          <Image src="/taxilog-logo-simple.svg" alt="TaxiLog" width={64} height={64} priority />
        </div>
      </div>
      <p className="text-center text-gray-600 mb-8 font-medium">Créer un compte propriétaire</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom complet
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jean Dupont"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 placeholder-gray-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de téléphone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+2250701020304"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 placeholder-gray-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Au moins 8 caractères"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 placeholder-gray-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              {showPassword ? '🙈 Masquer' : '👁️ Voir'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Répétez le mot de passe"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 placeholder-gray-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              {showConfirmPassword ? '🙈 Masquer' : '👁️ Voir'}
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold py-3 px-4 rounded-lg transition"
        >
          {loading ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Déjà inscrit ?{' '}
        <Link href="/login" className="text-amber-600 hover:underline font-semibold">
          Se connecter
        </Link>
      </div>
    </div>
  );
}
