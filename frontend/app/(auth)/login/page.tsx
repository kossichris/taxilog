'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/v1/auth/login', { phone, password, rememberMe });
      const { access_token, refresh_token, user } = response.data;

      // Stocker les tokens en localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('userRole', user.role);

      // Stocker aussi en cookies pour le middleware
      document.cookie = `access_token=${access_token}; path=/; max-age=${rememberMe ? 2592000 : 604800}`;
      document.cookie = `userRole=${user.role}; path=/; max-age=${rememberMe ? 2592000 : 604800}`;

      // Mettre à jour le store
      setUser(user);

      // Attendre un peu puis rediriger
      setTimeout(() => {
        if (user.role === 'OWNER') {
          router.push('/dashboard');
        } else {
          router.push('/driver');
        }
      }, 200);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Erreur de connexion. Vérifiez vos identifiants.',
      );
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

      <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="Votre mot de passe"
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

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-amber-600 rounded focus:ring-2 focus:ring-amber-500 cursor-pointer"
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 cursor-pointer">
            Se rappeler de moi (30 jours)
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold py-3 px-4 rounded-lg transition"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Pas encore inscrit ?{' '}
        <Link href="/register" className="text-amber-600 hover:underline font-semibold">
          Créer un compte
        </Link>
      </div>
    </div>
  );
}
