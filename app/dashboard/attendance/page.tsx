'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { UserCheck, UserX, Clock, FileText, CalendarCheck, Calendar } from 'lucide-react';

// Sesuaikan interface dengan Model Sequelize
interface Attendance {
  id: number;
  date: string; // DATEONLY dari DB = string "YYYY-MM-DD"
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  createdAt: string;
}

export default function AttendancePage() {
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/attendance');
        // Handle response structure
        const data = Array.isArray(res.data) ? res.data : res.data.data || res.data.attendance || [];
        
        // Opsional: Sorting dari tanggal terbaru ke terlama
        data.sort((a: Attendance, b: Attendance) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setAttendanceList(data);
      } catch (error) {
        console.error('Gagal ambil data kehadiran', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // --- STATISTIK ---
  // Menghitung jumlah status secara manual dari data frontend
  const stats = {
    present: attendanceList.filter((a) => a.status === 'Present').length,
    late: attendanceList.filter((a) => a.status === 'Late').length,
    excused: attendanceList.filter((a) => a.status === 'Excused').length,
    absent: attendanceList.filter((a) => a.status === 'Absent').length,
  };
  
  // Persentase Kehadiran (Present + Late dianggap masuk)
  const totalDays = attendanceList.length;
  const attendancePercentage = totalDays > 0 
    ? (((stats.present + stats.late) / totalDays) * 100).toFixed(0) 
    : 0;

  // --- HELPERS ---
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Present':
        return { label: 'Hadir', color: 'bg-green-100 text-green-700', icon: UserCheck };
      case 'Late':
        return { label: 'Terlambat', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
      case 'Excused':
        return { label: 'Izin/Sakit', color: 'bg-blue-100 text-blue-700', icon: FileText };
      case 'Absent':
        return { label: 'Alpa', color: 'bg-red-100 text-red-700', icon: UserX };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: Calendar };
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat data absensi...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <CalendarCheck className="mr-3 text-blue-600" /> Riwayat Kehadiran
      </h1>

      {/* --- BAGIAN 1: KARTU STATISTIK --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Hadir */}
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center">
            <div className="bg-green-100 p-2 rounded-full mb-2">
                <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">{stats.present}</span>
            <span className="text-xs text-gray-500">Hadir</span>
        </div>

        {/* Terlambat */}
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center">
            <div className="bg-yellow-100 p-2 rounded-full mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">{stats.late}</span>
            <span className="text-xs text-gray-500">Terlambat</span>
        </div>

        {/* Izin/Sakit */}
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center">
            <div className="bg-blue-100 p-2 rounded-full mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">{stats.excused}</span>
            <span className="text-xs text-gray-500">Izin/Sakit</span>
        </div>

        {/* Alpa */}
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center">
            <div className="bg-red-100 p-2 rounded-full mb-2">
                <UserX className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">{stats.absent}</span>
            <span className="text-xs text-gray-500">Alpa</span>
        </div>
      </div>

      {/* --- BANNER PERSENTASE --- */}
      <div className="bg-blue-600 text-white rounded-xl p-6 shadow-md mb-8 flex justify-between items-center">
         <div>
            <h3 className="text-lg font-semibold">Persentase Kehadiran</h3>
            <p className="text-blue-100 text-sm">Pertahankan kehadiranmu di atas 90%!</p>
         </div>
         <div className="text-4xl font-bold">
            {attendancePercentage}%
         </div>
      </div>

      {/* --- BAGIAN 2: TABEL RIWAYAT --- */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Waktu Input</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {attendanceList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data absensi.
                  </td>
                </tr>
              ) : (
                attendanceList.map((item) => {
                  const config = getStatusConfig(item.status);
                  const StatusIcon = config.icon;
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {formatDate(item.date)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1.5" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                         {new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}