'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  CreditCard, CheckCircle, AlertCircle, Clock, 
  Calendar, Receipt, Loader2, Wallet 
} from 'lucide-react';

// 1. Interface disesuaikan dengan JSON API Anda
interface Fee {
  name: string;
  type?: string; // Di JSON Anda type tidak muncul di dalam objek Fee, jadi kita buat optional
}

interface Bill {
  id: number;
  billNumber: string;
  amount: string; // JSON mengirim string "1500000.00"
  status: 'Pending' | 'Paid' | 'Overdue';
  dueDate: string;
  paidDate?: string | null;
  month?: number | null;
  year?: number;
  createdAt: string;
  Fee?: Fee;
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await api.get('/bills');
        
        // --- PERBAIKAN UTAMA DI SINI ---
        // Cek apakah ada property 'bills' (sesuai JSON Anda)
        let data = [];
        if (res.data.bills && Array.isArray(res.data.bills)) {
            data = res.data.bills;
        } else if (Array.isArray(res.data.data)) {
            data = res.data.data;
        } else if (Array.isArray(res.data)) {
            data = res.data;
        }
        
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
      maximumFractionDigits: 0,
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

  const getPeriodName = (month?: number | null, year?: number) => {
    if (!month || !year) return '';
    const date = new Date(year, month - 1);
    return date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  };

  // Helper Config untuk UI Status
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Paid':
        return { label: 'Lunas', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle };
      case 'Overdue':
        return { label: 'Jatuh Tempo', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle };
      default: // Pending
        return { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock };
    }
  };

  // Hitung Total Tagihan Belum Lunas
  const totalUnpaid = bills
    .filter(b => b.status !== 'Paid')
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="w-10 h-10 mb-2 animate-spin text-blue-600" />
        <p>Memuat data keuangan...</p>
    </div>
  );

  return (
    <div className="pb-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3 md:mr-4">
                    <Wallet className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                </div>
                Keuangan
            </h1>
            <p className="text-gray-500 text-sm md:text-base mt-2 md:pl-14">
                Informasi tagihan dan riwayat pembayaran sekolah.
            </p>
        </div>

        {/* Widget Total Tagihan */}
        <div className="w-full lg:w-auto">
            <div className={`px-5 py-4 rounded-xl shadow-sm border flex items-center justify-between lg:justify-start bg-white transition-colors duration-300 ${totalUnpaid > 0 ? 'border-red-200 bg-red-50/50' : 'border-green-200 bg-green-50/50'}`}>
                <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${totalUnpaid > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Sisa Tagihan</p>
                        <p className="text-[10px] text-gray-400 hidden sm:block">Perlu dibayarkan</p>
                    </div>
                </div>
                <div className="text-right lg:ml-8">
                    <p className={`font-bold text-xl md:text-2xl ${totalUnpaid > 0 ? 'text-red-700' : 'text-green-700'}`}>
                        {formatRupiah(totalUnpaid)}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      {bills.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white p-16 rounded-xl border border-dashed text-center">
           <div className="bg-gray-50 p-4 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-400" />
           </div>
           <h3 className="text-lg font-semibold text-gray-700">Tidak Ada Tagihan</h3>
           <p className="text-gray-500 text-sm mt-1">Saat ini Anda tidak memiliki riwayat tagihan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {bills.map((bill) => {
            const statusStyle = getStatusConfig(bill.status);
            const StatusIcon = statusStyle.icon;

            return (
              <div key={bill.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group relative">
                
                {/* Garis Status */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    bill.status === 'Paid' ? 'bg-green-500' : (bill.status === 'Overdue' ? 'bg-red-500' : 'bg-yellow-500')
                }`}></div>

                {/* Header Card */}
                <div className="p-5 border-b border-gray-50 pl-6 flex justify-between items-start">
                    <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                            {/* Karena di JSON 'type' tidak ada di dalam Fee, kita tampilkan teks statis atau logic lain */}
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                TAGIHAN
                            </span>
                            <div className="w-1 h-1 rounded-full bg-gray-300"></div> 
                            <span className="text-[10px] text-gray-400 font-mono" title={bill.billNumber}>
                                {bill.billNumber} {/* Mempersingkat No Tagihan */}
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-2">
                            {bill.Fee?.name || 'Biaya Sekolah'}
                        </h3>
                        {/* Cek apakah ada bulan/tahun (SPP) atau null (Gedung) */}
                        {bill.month && bill.year ? (
                            <p className="text-sm text-blue-600 font-medium mt-0.5">
                                {getPeriodName(bill.month, bill.year)}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-400 font-medium mt-0.5">
                                Sekali Bayar
                            </p>
                        )}
                    </div>
                    
                    <div className={`p-2 rounded-full shrink-0 ${statusStyle.color}`}>
                        <StatusIcon className="w-5 h-5" />
                    </div>
                </div>

                {/* Body Card */}
                <div className="p-5 pl-6 flex flex-col justify-between flex-1">
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Nominal</p>
                        <p className="text-2xl font-bold text-gray-800 mb-4">
                            {formatRupiah(bill.amount)}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                Jatuh Tempo
                            </span>
                            <span className={`font-medium ${bill.status === 'Overdue' ? 'text-red-600' : 'text-gray-700'}`}>
                                {formatDate(bill.dueDate)}
                            </span>
                        </div>

                        {bill.status === 'Paid' && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                    Dibayar pada
                                </span>
                                <span className="font-medium text-gray-700">
                                    {formatDate(bill.paidDate || '')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Status */}
                <div className={`px-5 py-2.5 text-center text-xs font-bold uppercase tracking-wide pl-6 ${statusStyle.color}`}>
                    {statusStyle.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}