'use client';

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { UserCheck, UserX, Clock, FileText, CalendarCheck, Loader2, BookOpen } from 'lucide-react';

// Interface disesuaikan dengan Controller Baru
interface Attendance {
  id: number;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  createdAt: string;
  // Relasi dari Backend
  Schedule?: {
    startTime: string;
    Subject?: {
        name: string;
    }
  };
}

export default function AttendancePage() {
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/attendance'); // Pastikan route backend benar
        const data = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        setAttendanceList(data);
      } catch (error) {
        console.error('Gagal ambil data kehadiran', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // 2. Logic Grouping (Per Mapel)
  const groupedAttendance = useMemo(() => {
    const groups: Record<string, Attendance[]> = {};
    
    attendanceList.forEach((item) => {
      // Ambil nama mapel dari relasi Schedule -> Subject
      const subjectName = item.Schedule?.Subject?.name || 'Kegiatan Lain';
      
      if (!groups[subjectName]) {
        groups[subjectName] = [];
      }
      groups[subjectName].push(item);
    });

    return groups;
  }, [attendanceList]);

  // Helper: Config Icon & Warna Status
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Present': return { label: 'Hadir', color: 'text-green-600 bg-green-50 border-green-200', icon: UserCheck };
      case 'Late':    return { label: 'Terlambat', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Clock };
      case 'Excused': return { label: 'Izin', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: FileText };
      case 'Absent':  return { label: 'Alpa', color: 'text-red-600 bg-red-50 border-red-200', icon: UserX };
      default:        return { label: status, color: 'text-gray-600 bg-gray-50', icon: UserCheck };
    }
  };

  // Helper: Hitung Persentase Kehadiran per Group
  const calculatePercentage = (items: Attendance[]) => {
    if (items.length === 0) return 0;
    // Hadir & Terlambat dianggap masuk
    const presentCount = items.filter(i => i.status === 'Present' || i.status === 'Late').length;
    return Math.round((presentCount / items.length) * 100);
  };

  // Helper: Hitung Global Stats
  const globalStats = useMemo(() => {
    const total = attendanceList.length;
    const present = attendanceList.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, percentage };
  }, [attendanceList]);


  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="w-10 h-10 mb-2 animate-spin text-blue-600" />
        <p>Memuat Data Absensi...</p>
    </div>
  );

  return (
    <div>
      {/* HEADER & GLOBAL STATS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <CalendarCheck className="mr-3 text-blue-600" /> Riwayat Kehadiran
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-9">Monitoring kehadiran per mata pelajaran.</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-4 ml-9 md:ml-0">
             {/* Card Global Persentase */}
            <div className={`px-5 py-2 rounded-lg shadow-sm border flex items-center ${globalStats.percentage >= 90 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${globalStats.percentage >= 90 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                    <p className="text-xs text-gray-500">Total Kehadiran</p>
                    <p className={`font-bold text-lg ${globalStats.percentage >= 90 ? 'text-green-700' : 'text-red-700'}`}>
                        {globalStats.percentage}%
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      {Object.keys(groupedAttendance).length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-400">
           <UserX className="w-12 h-12 mx-auto mb-3 opacity-20" />
           <p>Belum ada data absensi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(groupedAttendance).map(([subjectName, items]) => {
             const percentage = calculatePercentage(items);
             
             return (
              <div key={subjectName} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
                
                {/* Header Card */}
                <div className="p-4 border-b bg-gray-50 flex justify-between items-start">
                    <div className="flex items-center overflow-hidden">
                        <div className="bg-white p-2 rounded-lg border mr-3 text-blue-600 shrink-0">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm truncate pr-2">{subjectName}</h3>
                    </div>
                    
                    {/* Badge Persentase Mapel */}
                    <div className={`px-2 py-1 rounded text-xs font-bold border ${percentage >= 80 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        {percentage}%
                    </div>
                </div>

                {/* Body: List 5 Terakhir saja agar tidak kepanjangan */}
                <div className="p-0 flex-1">
                    <div className="divide-y">
                        {items.slice(0, 5).map((item) => { // Tampilkan max 5 history
                            const config = getStatusConfig(item.status);
                            const Icon = config.icon;
                            return (
                                <div key={item.id} className="p-3 flex justify-between items-center hover:bg-gray-50 text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <span className="text-xs font-medium w-24">
                                            {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                    <div className={`flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.color}`}>
                                        <Icon className="w-3 h-3 mr-1" />
                                        {config.label}
                                    </div>
                                </div>
                            )
                        })}
                        {items.length > 5 && (
                            <div className="p-2 text-center text-xs text-gray-400 bg-gray-50">
                                +{items.length - 5} riwayat lainnya
                            </div>
                        )}
                    </div>
                </div>
              </div>
             );
          })}
        </div>
      )}
    </div>
  );
}