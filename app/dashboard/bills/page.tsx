'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { CreditCard, CheckCircle, AlertCircle, Clock, Calendar, Receipt } from 'lucide-react';

// 1. Interface Fee sesuai Model
interface Fee {
  id: number;
  name: string;
  type: string; // 'Gedung', 'SPP', 'Catering', 'Other'
}

// 2. Interface Bill sesuai Model
interface Bill {
  id: number;
  billNumber: string;
  amount: string | number; // Decimal di JSON seringkali jadi string
  status: 'Pending' | 'Paid' | 'Overdue';
  dueDate: string;
  paidDate?: string | null;
  month?: number;
  year?: number;
  createdAt: string;
  Fee?: Fee; // Relasi ke Fee
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await api.get('/bills');
        const data = Array.isArray(res.data) ? res.data : res.data.data || res.data.bills || [];
        setBills(data);
      } catch (error) {
        console.error('Gagal ambil tagihan', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  // --- HELPERS ---

  const formatRupiah = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Ubah angka bulan (1-12) jadi nama bulan
  const getPeriodName = (month?: number, year?: number) => {
    if (!month || !year) return '';
    const date = new Date(year, month - 1); // JS month mulai dari 0
    return date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Lunas
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" /> Terlambat
          </span>
        );
      default: // Pending
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> Menunggu Pembayaran
          </span>
        );
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat data keuangan...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <CreditCard className="mr-3 text-blue-600" /> Tagihan & Keuangan
      </h1>

      {/* Ringkasan Singkat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold">Tagihan Belum Lunas</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {bills.filter(b => b.status === 'Pending' || b.status === 'Overdue').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">No. Tagihan</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Keterangan</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Jatuh Tempo</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Nominal</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Tgl Bayar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 flex flex-col items-center justify-center w-full">
                    <Receipt className="w-12 h-12 text-gray-300 mb-2" />
                    <span>Tidak ada data tagihan saat ini.</span>
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                    {/* 1. No Tagihan */}
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{bill.billNumber}
                    </td>

                    {/* 2. Keterangan (Gabungan Fee Name + Bulan/Tahun) */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="font-semibold">{bill.Fee?.name || 'Biaya Sekolah'}</div>
                      {bill.month && bill.year && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          Periode: {getPeriodName(bill.month, bill.year)}
                        </div>
                      )}
                      {/* Tampilkan tipe jika ada */}
                      {bill.Fee?.type && (
                         <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 mt-1 inline-block">
                           {bill.Fee.type}
                         </span>
                      )}
                    </td>

                    {/* 3. Jatuh Tempo */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className={`flex items-center ${bill.status === 'Overdue' ? 'text-red-600 font-bold' : ''}`}>
                        <Calendar className="w-3 h-3 mr-1.5" />
                        {formatDate(bill.dueDate)}
                      </div>
                    </td>

                    {/* 4. Nominal */}
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">
                      {formatRupiah(bill.amount)}
                    </td>

                    {/* 5. Status Badge */}
                    <td className="px-6 py-4">
                      {getStatusBadge(bill.status)}
                    </td>

                    {/* 6. Tanggal Bayar */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {bill.paidDate ? formatDate(bill.paidDate) : '-'}
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