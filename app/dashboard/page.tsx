'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { User, Book, Clock, MapPin, Phone, Users, CheckCircle, XCircle, Utensils } from 'lucide-react';

// Interface sesuai Model Student + Relasi Class
interface StudentProfile {
  id: number;
  nis: string;
  name: string;
  email?: string; // Di model tidak ada email siswa, tapi siapa tahu backend kirim
  parentName: string;
  parentContact: string;
  address: string;
  photo?: string;
  isActive: boolean;
  isCatering: boolean;
  Class?: {
    name: string; // e.g. "7A"
    level: number; // e.g. 7
  };
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile'); // Pastikan endpoint ini me-return data student + class
        // Handle jika response dibungkus { data: ... }
        const data = res.data.data || res.data;
        setProfile(data);
      } catch (error) {
        console.error('Gagal mengambil profil', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat data profil...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Halo, {profile?.name || 'Siswa'}!</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI: Kartu Utama */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Foto Profil / Avatar Placeholder */}
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden border-4 border-white shadow-sm">
              {profile?.photo ? (
                <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-blue-600" />
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-800">{profile?.name}</h2>
              <p className="text-gray-500 font-medium">NIS: {profile?.nis}</p>
              
              <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                {/* Badge Kelas */}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                  <Book className="w-3 h-3 mr-1.5" />
                  Kelas {profile?.Class?.name || 'Belum Diatur'}
                </span>
                
                {/* Badge Status Aktif */}
                {profile?.isActive ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1.5" /> Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700">
                    <XCircle className="w-3 h-3 mr-1.5" /> Non-Aktif
                  </span>
                )}

                {/* Badge Catering */}
                {profile?.isCatering && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-50 text-orange-700">
                    <Utensils className="w-3 h-3 mr-1.5" /> Katering
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info Detail */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b">
              <h3 className="font-semibold text-gray-700">Informasi Pribadi</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Nama Orang Tua</label>
                <div className="flex items-center mt-1 text-gray-800">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  {profile?.parentName || '-'}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Kontak Orang Tua</label>
                <div className="flex items-center mt-1 text-gray-800">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {profile?.parentContact || '-'}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Alamat</label>
                <div className="flex items-start mt-1 text-gray-800">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                  {profile?.address || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Statistik Kecil */}
        <div className="space-y-6">
          {/* Anda bisa menambahkan widget pengumuman atau jadwal hari ini di sini */}
          <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md">
            <h3 className="font-bold text-lg mb-2">Selamat Belajar!</h3>
            <p className="text-blue-100 text-sm">
              Jangan lupa cek jadwal pelajaran dan tugas hari ini. Pertahankan kehadiranmu!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}