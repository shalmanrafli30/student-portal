'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Calendar, Clock, User, BookOpen, AlertCircle, Loader2 } from 'lucide-react';

// Interface
interface ScheduleItem {
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

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // Update endpoint agar sesuai dengan controller backend (/student/schedules)
        const res = await api.get('/schedule'); 
        const data = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        setSchedules(data);
      } catch (error) {
        console.error('Gagal ambil jadwal', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Urutan hari untuk sorting (Senin - Sabtu)
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Helper Translate Hari
  const translateDay = (day: string) => {
    const map: Record<string, string> = {
      'Monday': 'Senin', 'Tuesday': 'Selasa', 'Wednesday': 'Rabu',
      'Thursday': 'Kamis', 'Friday': 'Jumat', 'Saturday': 'Sabtu', 'Sunday': 'Minggu'
    };
    return map[day] || day;
  };

  // Helper Format Jam (07:00:00 -> 07:00)
  const formatTime = (time: string) => {
    if (!time) return '--:--';
    return time.split(':').slice(0, 2).join(':');
  };

  // Grouping Logic: Mengelompokkan Array Flat menjadi Object per Hari
  const groupedSchedules = daysOrder.reduce((acc, day) => {
    const items = schedules.filter((item) => item.day === day);
    if (items.length > 0) {
      // Sort mapel berdasarkan jam mulai
      items.sort((a, b) => a.startTime.localeCompare(b.startTime));
      acc[day] = items;
    }
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="w-10 h-10 mb-2 animate-spin text-blue-600" />
        <p>Memuat jadwal pelajaran...</p>
    </div>
  );

  return (
    <div>
      {/* Header Halaman */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Calendar className="mr-3 text-blue-600" /> Jadwal Pelajaran
        </h1>
        <p className="text-gray-500 text-sm mt-1 ml-9">
            Daftar mata pelajaran aktif semester ini.
        </p>
      </div>

      {/* Konten Jadwal */}
      {Object.keys(groupedSchedules).length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white p-16 rounded-xl border border-dashed text-center">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
             <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Belum Ada Jadwal</h3>
          <p className="text-gray-500 max-w-sm mt-1">
            Jadwal pelajaran untuk kelas Anda belum diatur oleh admin kurikulum.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Loop setiap hari yang ada jadwalnya */}
          {Object.entries(groupedSchedules).map(([day, items]) => (
            <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
              
              {/* Header Hari */}
              <div className="bg-blue-50 px-5 py-3 border-b border-blue-100 flex justify-between items-center">
                <h3 className="font-bold text-blue-800">{translateDay(day)}</h3>
                <span className="text-xs bg-white text-blue-600 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
                  {items.length} Mapel
                </span>
              </div>
              
              {/* List Mata Pelajaran */}
              <div className="p-0">
                {items.map((item, index) => (
                  <div key={item.id} className={`flex items-start p-4 ${index !== items.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition-colors`}>
                    
                    {/* Kolom Waktu */}
                    <div className="bg-gray-100 p-2 rounded-lg mr-4 text-center min-w-[70px] flex flex-col justify-center border border-gray-200">
                      <Clock className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
                      <span className="text-xs font-bold text-gray-800 block leading-tight">
                        {formatTime(item.startTime)}
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        s/d {formatTime(item.endTime)}
                      </span>
                    </div>

                    {/* Kolom Detail */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-sm truncate pr-2" title={item.Subject?.name}>
                        {item.subjectName || item.Subject?.name || 'Mata Pelajaran'}
                      </h4>
                      
                      {/* Kode Mapel (Opsional) */}
                      {item.subjectCode && (
                        <div className="flex items-center text-[10px] text-gray-400 mb-1.5">
                          <BookOpen className="w-3 h-3 mr-1" /> {item.subjectCode}
                        </div>
                      )}
                      
                      {/* Nama Guru */}
                      <div className="inline-flex items-center text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 max-w-full">
                        <User className="w-3 h-3 mr-1.5 shrink-0 text-blue-500" />
                        <span className="truncate">Guru: {item.teacherName || 'Guru Belum Ditentukan'}</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}