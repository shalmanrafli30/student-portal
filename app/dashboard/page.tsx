'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  User, Book, MapPin, Phone, Users, CheckCircle, 
  XCircle, Utensils, Calendar, TrendingUp, Clock 
} from 'lucide-react';

interface StudentProfile {
  id: number;
  nis: string;
  name: string;
  parentName: string;
  parentContact: string;
  address: string;
  photo?: string;
  isActive: boolean;
  isCatering: boolean;
  ClassName?: string;
  Class?: {
    id: number;
    name: string;
    level: number;
  };
}

interface Schedule {
  id: number;
  day: string; 
  startTime: string; 
  endTime: string;
  // Update: Menyesuaikan dengan respon API terbaru
  subjectName?: string;
  subjectCode?: string; // [BARU] Kode Mapel
  teacherName?: string; // [BARU] Nama Guru
  
  // Fallback (jika API berubah lagi)
  Subject?: { name: string; };
  Teacher?: { name: string; };
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]); // State untuk jadwal
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');

  // Helper: Konversi Index Hari JS (0-6) ke Nama Hari Inggris (Database)
  const getDayName = (dayIndex: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };

  useEffect(() => {
    // 1. Set Tanggal UI
    const date = new Date();
    setCurrentDate(date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    
    // Ambil nama hari ini (misal: "Monday") untuk filter jadwal
    const todayName = getDayName(date.getDay());

    const fetchData = async () => {
      try {
        // --- REQUEST 1: PROFIL ---
        const resProfile = await api.get('/profile'); 
        const profileData = resProfile.data.data || resProfile.data;
        setProfile(profileData);

        // --- REQUEST 2: JADWAL ---
        // Kita request semua jadwal, lalu filter di frontend
        const resSchedule = await api.get('/schedule'); 
        const scheduleData = Array.isArray(resSchedule.data.data) ? resSchedule.data.data : (Array.isArray(resSchedule.data) ? resSchedule.data : []);

        // Filter: Hanya ambil jadwal yang harinya SAMA dengan hari ini
        const todays = scheduleData
            .filter((s: Schedule) => s.day === todayName)
            .sort((a: Schedule, b: Schedule) => a.startTime.localeCompare(b.startTime)); // Urutkan jam

        setTodaySchedules(todays);

      } catch (error) {
        console.error('Gagal mengambil data dashboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
        <p>Memuat dashboard...</p>
    </div>
  );

  return (
    <div>
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
           <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
             Halo, <span className="text-blue-600">{profile?.name?.split(' ')[0] || 'Siswa'}</span>! 👋
           </h1>
           <p className="text-gray-500 mt-1">Selamat datang kembali di Portal Siswa.</p>
        </div>
        <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-full shadow-sm border flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            {currentDate}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI (2/3): Profil */}
        <div className="lg:col-span-2 space-y-6">
          {/* CARD PROFIL (Sama seperti sebelumnya) */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="h-24 bg-linear-to-r from-blue-600 to-blue-400"></div>
            <div className="px-6 pb-6 relative">
                <div className="flex justify-between items-end -mt-12 mb-4">
                    <div className="w-24 h-24 bg-white p-1 rounded-full shadow-md">
                        <div className="w-full h-full bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                            {profile?.photo ? (
                                <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-gray-400" />
                            )}
                        </div>
                    </div>
                    <div className="mb-2">
                        {profile?.isActive ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1.5" /> AKTIF
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                <XCircle className="w-3 h-3 mr-1.5" /> NON-AKTIF
                            </span>
                        )}
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{profile?.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-gray-600">
                        <span className="flex items-center text-sm font-medium bg-gray-100 px-2 py-0.5 rounded">
                            <Users className="w-3 h-3 mr-1.5" /> NIS: {profile?.nis}
                        </span>
                        <span className="flex items-center text-sm font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                            <Book className="w-3 h-3 mr-1.5" /> Kelas {profile?.ClassName || profile?.Class?.name || '-'}
                        </span>
                        {profile?.isCatering && (
                            <span className="flex items-center text-sm font-medium bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
                                <Utensils className="w-3 h-3 mr-1.5" /> Katering
                            </span>
                        )}
                    </div>
                </div>
            </div>
          </div>

          {/* CARD DETAIL INFORMASI (Sama seperti sebelumnya) */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" /> Informasi Pribadi & Wali
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                 <div>
                    <label className="text-xs text-gray-400 uppercase font-bold">Nama Orang Tua</label>
                    <p className="font-medium text-gray-700 mt-1">{profile?.parentName}</p>
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 uppercase font-bold">Kontak Orang Tua</label>
                    <div className="flex items-center mt-1 text-gray-700 font-medium">
                        <Phone className="w-3.5 h-3.5 mr-2 text-green-600" />
                        {profile?.parentContact}
                    </div>
                 </div>
                 <div className="md:col-span-2">
                    <label className="text-xs text-gray-400 uppercase font-bold">Alamat Rumah</label>
                    <div className="flex items-start mt-1 text-gray-700">
                        <MapPin className="w-4 h-4 mr-2 text-red-500 mt-0.5 shrink-0" />
                        <span>{profile?.address}</span>
                    </div>
                 </div>
             </div>
          </div>
        </div>

        {/* KOLOM KANAN (1/3): Widget */}
        <div className="space-y-6">
          
          {/* WIDGET 1: BANNER */}
          <div className="bg-linear-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="font-bold text-lg mb-1">Mulai Belajar!</h3>
                <p className="text-blue-100 text-sm mb-4">
                    Pantau terus jadwal pelajaran agar tidak tertinggal.
                </p>
            </div>
            <Clock className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-10" />
          </div>

          {/* WIDGET 2: JADWAL HARI INI (SUDAH DINAMIS) */}
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Jadwal Hari Ini</h3>
                <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-500">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long' })}
                </span>
            </div>
            
            <div className="space-y-3">
                {todaySchedules.length > 0 ? (
                  todaySchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center p-3 rounded-xl bg-blue-50 border border-blue-100 transition hover:shadow-sm">
                        <div className="bg-blue-200 text-blue-700 text-xs font-bold px-2 py-1 rounded mr-3 shrink-0">
                            {schedule.startTime.slice(0, 5)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-800 truncate">{schedule.subjectName || schedule.Subject?.name || 'Mata Pelajaran'}</p>
                            <p className="text-xs text-gray-500 truncate">{schedule.Teacher?.name || 'Guru Pengampu'}</p>
                        </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">Tidak ada jadwal hari ini.</p>
                      <p className="text-[10px] text-gray-400 mt-1">Selamat beristirahat!</p>
                  </div>
                )}
            </div>
          </div>

          {/* WIDGET 3: STATISTIK MINI */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
                <div className="flex justify-center mb-2">
                    <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                </div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-bold text-gray-800 text-sm">{profile?.isActive ? 'Aktif' : 'Non-Aktif'}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
                <div className="flex justify-center mb-2">
                    <div className="bg-orange-100 p-2 rounded-full">
                        <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                </div>
                <p className="text-xs text-gray-500">Katering</p>
                <p className="font-bold text-gray-800 text-sm">{profile?.isCatering ? 'Ya' : 'Tidak'}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}