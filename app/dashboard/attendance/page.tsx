'use client';

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { UserCheck, UserX, Clock, FileText, CalendarCheck, Loader2, BookOpen, AlertCircle } from 'lucide-react';

interface Attendance {
  id: number;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  createdAt: string;
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
        const res = await api.get('/attendance');
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

  // 2. Logic Grouping
  const groupedAttendance = useMemo(() => {
    const groups: Record<string, Attendance[]> = {};
    attendanceList.forEach((item) => {
      const subjectName = item.Schedule?.Subject?.name || 'Kegiatan Lain';
      if (!groups[subjectName]) groups[subjectName] = [];
      groups[subjectName].push(item);
    });
    return groups;
  }, [attendanceList]);

  // Helper UI
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Present': return { label: 'Hadir', color: 'text-green-700 bg-green-50 border-green-200', icon: UserCheck };
      case 'Late':    return { label: 'Terlambat', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: Clock };
      case 'Excused': return { label: 'Izin', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: FileText };
      case 'Absent':  return { label: 'Alpa', color: 'text-red-700 bg-red-50 border-red-200', icon: UserX };
      default:        return { label: status, color: 'text-gray-600 bg-gray-50 border-gray-200', icon: UserCheck };
    }
  };

  const calculatePercentage = (items: Attendance[]) => {
    if (items.length === 0) return 0;
    const presentCount = items.filter(i => i.status === 'Present' || i.status === 'Late').length;
    return Math.round((presentCount / items.length) * 100);
  };

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
    <div className="pb-8"> {/* Padding bottom agar tidak mentok di scroll paling bawah */}
      
      {/* HEADER SECTION (Responsive Layout) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        
        {/* Judul Halaman */}
        <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3 md:mr-4">
                    <CalendarCheck className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                </div>
                Riwayat Kehadiran
            </h1>
            <p className="text-gray-500 text-sm md:text-base mt-2 md:pl-14">
                Monitoring status kehadiran Anda per mata pelajaran.
            </p>
        </div>
        
        {/* Statistik Global (Full Width di Mobile, Auto di Desktop) */}
        <div className="w-full lg:w-auto">
            <div className={`px-5 py-3 md:py-2 rounded-xl shadow-sm border flex items-center justify-between lg:justify-start bg-white transition-colors duration-300 ${globalStats.percentage >= 90 ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${globalStats.percentage >= 90 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Kehadiran</p>
                        <p className="text-xs text-gray-400 hidden sm:block">Akumulasi semua mapel</p>
                    </div>
                </div>
                <p className={`font-bold text-2xl lg:ml-6 ${globalStats.percentage >= 90 ? 'text-green-700' : 'text-red-700'}`}>
                    {globalStats.percentage}%
                </p>
            </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      {Object.keys(groupedAttendance).length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white p-12 md:p-20 rounded-2xl border border-dashed text-center">
           <div className="bg-gray-50 p-4 rounded-full mb-4">
                <UserX className="w-10 h-10 md:w-12 md:h-12 text-gray-300" />
           </div>
           <h3 className="text-lg font-semibold text-gray-700">Data Kosong</h3>
           <p className="text-gray-500 max-w-xs mx-auto">Belum ada data absensi yang tercatat di sistem.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Object.entries(groupedAttendance).map(([subjectName, items]) => {
             const percentage = calculatePercentage(items);
             
             return (
              <div key={subjectName} className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group">
                
                {/* Header Card */}
                <div className="bg-gray-50 px-4 md:px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center overflow-hidden flex-1 mr-2">
                        <div className="bg-white p-1.5 md:p-2 rounded-lg border mr-2.5 md:mr-3 text-blue-600 shadow-sm shrink-0">
                            <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm md:text-[15px] truncate leading-tight" title={subjectName}>
                            {subjectName}
                        </h3>
                    </div>
                    
                    {/* Badge Persentase */}
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border shrink-0 ${percentage >= 85 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        {percentage}%
                    </div>
                </div>

                {/* Body List */}
                <div className="p-0 flex-1 bg-white">
                    <div className="divide-y divide-gray-50">
                        {items.slice(0, 5).map((item) => { 
                            const config = getStatusConfig(item.status);
                            const Icon = config.icon;
                            return (
                                <div key={item.id} className="px-4 md:px-5 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center text-gray-600">
                                        <span className="text-xs md:text-sm font-medium">
                                            {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                    <div className={`flex items-center px-2 py-1 md:px-2.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold border ${config.color}`}>
                                        <Icon className="w-3 h-3 mr-1 md:mr-1.5" />
                                        {config.label}
                                    </div>
                                </div>
                            )
                        })}
                        
                        {items.length > 5 && (
                            <div className="bg-gray-50/50 p-2 text-center text-[10px] md:text-xs text-gray-400 border-t border-gray-100 cursor-default">
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