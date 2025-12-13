'use client';

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { GraduationCap, Award, Calculator, Calendar, BookOpen, TrendingUp } from 'lucide-react';

interface Grade {
  id: number;
  type: string;
  score: number;
  createdAt: string;
  Subject?: { name: string }; 
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
  // Mengelompokkan Array Flat menjadi Object { "Matematika": [Grade, Grade], "IPA": [Grade] }
  const groupedGrades = useMemo(() => {
    const groups: Record<string, Grade[]> = {};
    
    grades.forEach((grade) => {
      const subjectName = grade.Subject?.name || 'Lainnya';
      if (!groups[subjectName]) {
        groups[subjectName] = [];
      }
      groups[subjectName].push(grade);
    });

    return groups;
  }, [grades]);

  // Helper: Warna Badge Nilai
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-700 bg-green-50 border-green-200';
    if (score >= 70) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score < 70) return 'text-red-700 bg-red-50 border-red-200';
    return 'text-gray-700 bg-gray-50';
  };

  // Helper: Hitung Rata-rata Global
  const globalAverage = grades.length > 0
    ? (grades.reduce((acc, curr) => acc + curr.score, 0) / grades.length).toFixed(1)
    : 0;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <GraduationCap className="w-12 h-12 mb-4 animate-pulse" />
        <p>Sedang memuat data nilai...</p>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <GraduationCap className="mr-3 text-blue-600" /> Hasil Belajar
            </h1>
            <p className="text-gray-500 text-sm mt-1">Rekapitulasi nilai akademik Anda</p>
        </div>
      </div>

      {/* --- GRID CARD START --- */}
      {Object.keys(groupedGrades).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed text-gray-400">
           <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
           <p>Belum ada data nilai yang masuk.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(groupedGrades).map(([subjectName, subjectGrades]) => {
            // Hitung rata-rata per mapel
            const subAvg = (subjectGrades.reduce((a, b) => a + b.score, 0) / subjectGrades.length).toFixed(0);
            
            return (
              <div key={subjectName} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
                {/* Header Card */}
                <div className="p-5 border-b bg-gray-50 flex justify-between items-start">
                    <div className="flex items-center">
                        <div className="bg-white p-2 rounded-lg border mr-3 text-blue-600">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg leading-tight">{subjectName}</h3>
                            {/* <p className="text-xs text-gray-500 mt-1">{subjectGrades.length} Data Nilai</p> */}
                        </div>
                    </div>
                    {/* Badge Rata-rata Mapel */}
                    <div className="text-right">
                        <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Rata-rata</div>
                        <span className={`text-sm font-bold px-2 py-1 rounded ${Number(subAvg) >= 70 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                            {subAvg}
                        </span>
                    </div>
                </div>

                {/* Body Card (List Nilai) */}
                <div className="p-0 flex-1">
                    <div className="divide-y">
                        {subjectGrades.map((grade) => (
                            <div key={grade.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded">
                                            {grade.type}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(grade.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                </div>
                                <div className={`text-lg font-bold ${grade.score >= 70 ? 'text-gray-800' : 'text-red-600'}`}>
                                    {grade.score}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Footer Card (Opsional) */}
                <div className="bg-gray-50 px-4 py-2 border-t text-center">
                    <p className="text-xs text-gray-400">Terakhir update: {new Date(subjectGrades[0].createdAt).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}