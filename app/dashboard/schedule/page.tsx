'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Calendar, Clock, User, BookOpen, AlertCircle } from 'lucide-react';

// Interface sesuai Model-Model yang Anda berikan
interface ScheduleItem {
  id: number;
  day: string; // ENUM: 'Monday', 'Tuesday', ...
  startTime: string; // TIME format "HH:mm:ss"
  endTime: string;   // TIME format "HH:mm:ss"
  
  // Relasi (biasanya di-include oleh backend)
  Subject?: {
    name: string;
    code: string;
  };
  Teacher?: {
    name: string;
    nip: string;
  };
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await api.get('/schedule'); 
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setSchedules(data);
      } catch (error) {
        console.error('Gagal ambil jadwal', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Urutan hari harus sama persis dengan ENUM di database (Case Sensitive)
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Penerjemah hari ke Bahasa Indonesia
  const translateDay = (day: string) => {
    const map: Record<string, string> = {
      'Monday': 'Senin', 'Tuesday': 'Selasa', 'Wednesday': 'Rabu',
      'Thursday': 'Kamis', 'Friday': 'Jumat', 'Saturday': 'Sabtu'
    };
    return map[day] || day;
  };

  // Helper format jam (07:00:00 -> 07:00)
  const formatTime = (time: string) => {
    if (!time) return '--:--';
    return time.split(':').slice(0, 2).join(':');
  };

  // Grouping
  const groupedSchedules = daysOrder.reduce((acc, day) => {
    const items = schedules.filter((item) => item.day === day);
    if (items.length > 0) {
      // Sort berdasarkan jam mulai
      items.sort((a, b) => a.startTime.localeCompare(b.startTime));
      acc[day] = items;
    }
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading jadwal pelajaran...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Calendar className="mr-3 text-blue-600" /> Jadwal Pelajaran
      </h1>

      {Object.keys(groupedSchedules).length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white p-12 rounded-xl border border-dashed">
          <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500">Belum ada jadwal yang diatur untuk kelasmu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedSchedules).map(([day, items]) => (
            <div key={day} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              {/* Header Hari */}
              <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex justify-between items-center">
                <h3 className="font-bold text-blue-700">{translateDay(day)}</h3>
                <span className="text-xs bg-white text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                  {items.length} Mapel
                </span>
              </div>
              
              {/* List Pelajaran */}
              <div className="p-4 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start pb-3 border-b last:border-0 last:pb-0">
                    {/* Waktu */}
                    <div className="bg-gray-100 p-2 rounded-lg mr-3 text-center min-w-[65px]">
                      <Clock className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
                      <span className="text-xs font-bold text-gray-700 block">
                        {formatTime(item.startTime)}
                      </span>
                      <span className="text-[10px] text-gray-500 block">
                        - {formatTime(item.endTime)}
                      </span>
                    </div>

                    {/* Detail Mapel */}
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-sm flex items-center">
                        {item.Subject?.name || 'Mapel Umum'}
                      </h4>
                      {item.Subject?.code && (
                        <span className="text-[10px] text-gray-400 block mb-1">
                          Kode: {item.Subject.code}
                        </span>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded mt-1 w-fit">
                        <User className="w-3 h-3 mr-1.5" />
                        {item.Teacher?.name || 'Guru Pengganti'}
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