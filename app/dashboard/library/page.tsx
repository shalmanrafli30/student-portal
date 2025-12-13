'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Library, BookOpen, Search, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

// 1. Sesuaikan Interface dengan Model Sequelize LibraryBook
interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string; // Allow null
  stock: number;
}

// 2. Sesuaikan Interface dengan Model Sequelize LibraryLoan
interface Loan {
  id: number;
  loanDate: string;   // DATEONLY dari database akan jadi string "YYYY-MM-DD"
  dueDate: string;
  returnDate?: string | null;
  status: 'Borrowed' | 'Returned' | 'Overdue';
  // Backend biasanya menyertakan data buku dalam object relasi (misal: LibraryBook atau Book)
  LibraryBook?: Book; 
  Book?: Book; // Fallback jika nama relasinya 'Book'
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'loans' | 'books'>('loans');
  
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- FETCH DATA ---

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/library/loans');
      const data = Array.isArray(res.data) ? res.data : res.data.data || res.data.loans || [];
      setLoans(data);
    } catch (err) {
      console.error('Gagal ambil data peminjaman', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const endpoint = searchQuery 
        ? `/library/books?search=${searchQuery}` 
        : '/library/books';
      
      const res = await api.get(endpoint);
      const data = Array.isArray(res.data) ? res.data : res.data.data || res.data.books || [];
      setBooks(data);
    } catch (err) {
      console.error('Gagal cari buku', err);
    } finally {
      setLoading(false);
    }
  };

  // --- EFFECTS ---

  useEffect(() => {
    if (activeTab === 'loans') {
      fetchLoans();
    } else {
      fetchBooks();
    }
  }, [activeTab]);

  // Debounce search (tunggu user selesai ngetik 500ms baru fetch)
  useEffect(() => {
    if (activeTab === 'books') {
      const timer = setTimeout(() => {
        fetchBooks();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // --- HELPER FORMAT TANGGAL ---
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // --- HELPER WARNA STATUS ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Returned':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" /> Dikembalikan
          </span>
        );
      case 'Overdue':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertCircle className="w-3 h-3 mr-1" /> Terlambat
          </span>
        );
      default: // 'Borrowed'
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Clock className="w-3 h-3 mr-1" /> Sedang Dipinjam
          </span>
        );
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Library className="mr-3 text-blue-600" /> Perpustakaan
      </h1>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        <button
          onClick={() => setActiveTab('loans')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'loans'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Peminjaman Saya
        </button>
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'books'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Cari Buku
        </button>
      </div>

      {/* --- TAB 1: PEMINJAMAN SAYA --- */}
      {activeTab === 'loans' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="font-bold text-gray-800">Riwayat Peminjaman</h2>
            <p className="text-sm text-gray-500">Daftar buku yang sedang atau pernah kamu pinjam.</p>
          </div>
          
          <div className="divide-y">
            {loading ? (
               <div className="p-8 text-center text-gray-500">Memuat data peminjaman...</div>
            ) : loans.length === 0 ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <BookOpen className="w-12 h-12 text-gray-300 mb-2" />
                <p>Belum ada riwayat peminjaman.</p>
              </div>
            ) : (
              loans.map((loan) => {
                // Handle variasi nama relasi (LibraryBook atau Book)
                const bookData = loan.LibraryBook || loan.Book;
                
                return (
                  <div key={loan.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-start mb-4 md:mb-0">
                      <div className="bg-blue-50 p-3 rounded-lg mr-4 text-blue-600">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {bookData?.title || 'Judul Tidak Ditemukan'}
                        </h3>
                        <p className="text-gray-500 text-sm mb-1">
                          Penulis: {bookData?.author || '-'}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Pinjam: {formatDate(loan.loanDate)}
                          </span>
                          <span className={`flex items-center ${loan.status === 'Overdue' ? 'text-red-600 font-bold' : ''}`}>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Tenggat: {formatDate(loan.dueDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {getStatusBadge(loan.status)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: CARI BUKU --- */}
      {activeTab === 'books' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Cari judul buku, penulis, atau ISBN..."
              className="w-full pl-12 pr-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Grid Buku */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">Mencari buku di rak...</div>
          ) : books.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
              <p>Tidak ada buku yang cocok dengan pencarianmu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <div key={book.id} className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-shadow flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      book.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {book.stock > 0 ? `Stok: ${book.stock}` : 'Habis'}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 line-clamp-2 mb-1" title={book.title}>
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 flex-1">
                    {book.author}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t flex justify-between items-center text-xs text-gray-400">
                    <span>ISBN: {book.isbn || '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}