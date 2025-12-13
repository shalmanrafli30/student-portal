'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { GraduationCap, Award, Calculator, Calendar } from 'lucide-react';

interface Grade {
  id: number;
  type: string;  // Contoh: "UH1", "UTS", "Tugas"
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
        const res = await api.get('/grades');
        // Jaga-jaga: backend bisa kirim array langsung atau { data: [...] }
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setGrades(data);
      } catch (error) {
        console.error('Gagal ambil nilai', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  // Helper: Warna Badge Nilai
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-700 bg-green-100 border-green-200';
    if (score >= 70) return 'text-blue-700 bg-blue-100 border-blue-200';
    if (score < 70) return 'text-red-700 bg-red-100 border-red-200';
    return 'text-gray-700 bg-gray-100';
  };

  // Helper: Hitung Rata-rata
  const averageScore = grades.length > 0
    ? (grades.reduce((acc, curr) => acc + curr.score, 0) / grades.length).toFixed(1)
    : 0;

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data nilai...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <GraduationCap className="mr-3 text-blue-600" /> Hasil Belajar
      </h1>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Award className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Data Nilai</p>
            <h3 className="text-2xl font-bold">{grades.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-full">
            <Calculator className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Rata-rata Nilai</p>
            <h3 className="text-2xl font-bold">{averageScore}</h3>
          </div>
        </div>
      </div>

      {/* Tabel Nilai */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Mapel</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Kategori</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Nilai</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {grades.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data nilai.
                  </td>
                </tr>
              ) : (
                grades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {grade.Subject?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold uppercase">
                        {grade.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-2" />
                        {new Date(grade.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getScoreColor(grade.score)}`}>
                        {grade.score}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}