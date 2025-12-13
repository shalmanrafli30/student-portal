'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { BookOpen, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  // 1. Ubah state 'email' menjadi 'username'
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 2. Gunakan URL VPS (https://api.meccaschool.online...)
      // Pastikan endpoint auth-nya benar (biasanya /api/auth/login atau /auth/login)
      // Cek apakah di backend route-nya diawali /api atau langsung /auth
      const response = await axios.post('https://api.meccaschool.online/api/auth/login', {
        username: username, // Sesuai request backend
        password: password,
        role: 'student'     // WAJIB DITAMBAHKAN
      });

      // 3. Simpan Token
      // Pastikan response.data backend mengembalikan { token: "..." }
      // Jika strukturnya { data: { token: "..." } }, sesuaikan di sini.
      const token = response.data.token || response.data.data?.token;

      if (!token) {
        throw new Error('Token tidak ditemukan dalam respon server');
      }

      localStorage.setItem('token', token);
      
      // Redirect ke Dashboard
      router.push('/dashboard'); 
      
    } catch (err: any) {
      console.error(err);
      // Menampilkan pesan error dari backend jika ada
      const msg = err.response?.data?.message || 'Login gagal. Cek username/password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full">
            <BookOpen className="text-white w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Student Portal</h1>
        <p className="text-center text-gray-500 mb-8">Mecca School System</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-400"
              placeholder="Masukkan NIS (ex: 20256940)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}