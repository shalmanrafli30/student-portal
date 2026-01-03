'use client';

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { GraduationCap, BookOpen, Calendar, TrendingUp, Loader2 } from 'lucide-react';

interface Grade {
  id: number;
  type: string;
  score: number;
  createdAt: string;
  studentId: number;
  subjectId: number;
  subjectName?: string;
  Subject?: { name: string }; // Fallback
}

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await api.get('/grades'); // Pastikan endpoint benar
        const data = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        setGrades(data);
      } catch (error) {
        console.error('Gagal ambil nilai', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  // --- LOGIC GROUPING ---
  const groupedGrades = useMemo(() => {
    const groups: Record<string, Grade[]> = {};
    
    grades.forEach((grade) => {
      const subjectName = grade.subjectName || 'Lainnya';
      if (!groups[subjectName]) {
        groups[subjectName] = [];
      }
      groups[subjectName].push(grade);
    });

    return groups;
  }, [grades]);

  // Helper: Hitung Rata-rata Global
  const globalAverage = grades.length > 0
    ? (grades.reduce((acc, curr) => acc + curr.score, 0) / grades.length).toFixed(1)
    : '0';

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="w-10 h-10 mb-2 animate-spin text-blue-600" />
        <p>Memuat Hasil Belajar...</p>
    </div>
  );

  return (
    <div className="pb-8">
      {/* HEADER SECTION (Responsive) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        
        {/* Judul */}
        <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3 md:mr-4">
                    <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                </div>
                Hasil Belajar
            </h1>
            <p className="text-gray-500 text-sm md:text-base mt-2 md:pl-14">
                Rekapitulasi nilai akademik per mata pelajaran.
            </p>
        </div>

        {/* Global Stats Widget (Tampil Penuh di Mobile) */}
        <div className="w-full lg:w-auto">
            <div className="bg-white border border-blue-100 p-4 rounded-xl shadow-sm flex items-center justify-between lg:justify-start gap-6">
                <div className="flex items-center">
                    <div className="bg-blue-50 p-2 rounded-full mr-3">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Rata-rata</p>
                        <p className="text-xs text-gray-400">Keseluruhan</p>
                    </div>
                </div>
                <div className="text-right lg:text-left">
                    <span className="text-2xl font-bold text-gray-800">{globalAverage}</span>
                </div>
            </div>
        </div>
      </div>

      {/* --- GRID CARD START --- */}
      {Object.keys(groupedGrades).length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white p-16 rounded-xl border border-dashed text-center">
           <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
           <p className="text-gray-500">Belum ada data nilai yang masuk.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Object.entries(groupedGrades).map(([subjectName, subjectGrades]) => {
            // Hitung rata-rata per mapel
            const subAvg = (subjectGrades.reduce((a, b) => a + b.score, 0) / subjectGrades.length).toFixed(0);
            const numAvg = Number(subAvg);
            
            return (
              <div key={subjectName} className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
                
                {/* Header Card */}
                <div className="p-4 md:p-5 border-b bg-gray-50/50 flex justify-between items-start">
                    <div className="flex items-center flex-1 pr-2">
                        <div className="bg-white p-1.5 md:p-2 rounded-lg border mr-3 text-blue-600 shadow-sm shrink-0">
                            <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm md:text-base leading-tight line-clamp-1" title={subjectName}>
                                {subjectName}
                            </h3>
                            <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                                {subjectGrades.length} Data Nilai
                            </p>
                        </div>
                    </div>
                    {/* Badge Rata-rata Mapel */}
                    <div className="text-right shrink-0">
                        <span className={`text-xs md:text-sm font-bold px-2 py-1 rounded-lg border ${numAvg >= 75 ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
                            {subAvg}
                        </span>
                    </div>
                </div>

                {/* Body Card (List Nilai) */}
                <div className="p-0 flex-1 bg-white">
                    <div className="divide-y divide-gray-50">
                        {subjectGrades.map((grade) => (
                            <div key={grade.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors group">
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-[10px] md:text-xs font-bold text-gray-600 uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded border border-gray-200 group-hover:bg-white transition-colors">
                                            {grade.type}
                                        </span>
                                        <span className="text-[10px] md:text-xs text-gray-400 flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(grade.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                </div>
                                <div className={`text-base md:text-lg font-bold ${grade.score >= 75 ? 'text-gray-800' : 'text-red-600'}`}>
                                    {grade.score}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Footer Card (Tanggal Update) */}
                <div className="bg-gray-50 px-4 py-2 border-t text-center">
                    <p className="text-[10px] text-gray-400">
                        Update: {new Date(subjectGrades[0].createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}