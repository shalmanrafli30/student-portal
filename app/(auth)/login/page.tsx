'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { BookOpen, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://api.meccaschool.online/api/auth/login', {
        username: username,
        password: password,
        role: 'student'
      });

      const token = response.data.token || response.data.data?.token;

      if (!token) {
        throw new Error('Token tidak ditemukan dalam respon server');
      }

      localStorage.setItem('token', token);
      router.push('/dashboard'); 
      
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Login gagal. Cek username/password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Container Luar: Menggunakan min-h-screen, flex center, dan padding horizontal (px-4) agar tidak menempel di layar HP
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-gray-100 px-4 sm:px-6 lg:px-8">
      
      {/* Kartu Login: Lebar maksimal (max-w-md) tapi full width di layar kecil */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-blue-200 shadow-lg mb-4 transform transition hover:scale-105 duration-300">
            <BookOpen className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">Student Portal</h1>
          <p className="text-gray-500 text-sm sm:text-base text-center mt-1">Mecca School System</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm mb-6 text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">NIS / Username</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 bg-gray-50 focus:bg-white text-base"
              placeholder="Masukkan NIS (ex: 20256940)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 bg-gray-50 focus:bg-white text-base"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-200 hover:shadow-blue-300 flex justify-center items-center transform active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Masuk ke Portal'}
          </button>
        </form>

        {/* Footer Kecil (Opsional) */}
        <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
                &copy; {new Date().getFullYear()} Mecca School. All rights reserved.
            </p>
        </div>
      </div>
    </div>
  );
}