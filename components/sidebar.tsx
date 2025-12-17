'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  UserCheck, 
  GraduationCap, 
  BookOpen, 
  LogOut, 
  Menu, 
  X,
  Wallet
} from 'lucide-react';

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Jadwal', href: '/dashboard/schedule', icon: Calendar },
    { name: 'Kehadiran', href: '/dashboard/attendance', icon: UserCheck },
    { name: 'Nilai', href: '/dashboard/grades', icon: GraduationCap },
    { name: 'Keuangan', href: '/dashboard/bills', icon: Wallet },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* --- MOBILE HEADER --- */}
      <div className="bg-white p-4 shadow-sm flex justify-between items-center w-full fixed top-0 left-0 z-20 md:hidden">
         <span className="font-bold text-gray-800 text-lg">Mecca Student</span>
         <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
            {isOpen ? <X /> : <Menu />}
         </button>
      </div>

      {/* --- SIDEBAR CONTAINER --- */}
      <aside 
        className={`
          bg-white border-r border-gray-200 
          fixed top-0 left-0 h-screen z-30 
          transition-transform duration-300 ease-in-out
          flex flex-col  /* 1. Jadikan Flex Column */
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:sticky /* 2. Gunakan Sticky di Desktop */
        `}
        style={{ width: '16rem' }} // Set lebar fix 64 (16rem)
      >
        {/* Logo Area */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-center shrink-0">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
               <BookOpen className="text-white w-6 h-6" />
            </div>
            <div>
               <h1 className="text-xl font-bold text-gray-800">Mecca School</h1>
               <p className="text-xs text-gray-500">Student Portal</p>
            </div>
        </div>

        {/* Menu Items */}
        {/* 3. Tambahkan flex-1 agar nav mengisi sisa ruang kosong */}
        <nav className="p-4 space-y-2 overflow-y-auto flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        {/* 4. Hapus absolute bottom-0, biarkan dia di dasar flex container */}
        <div className="p-4 border-t border-gray-100 bg-white shrink-0">
           <button 
             onClick={handleLogout}
             className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
           >
              <LogOut className="w-5 h-5 mr-3" />
              Keluar
           </button>
        </div>
      </aside>

      {/* --- OVERLAY --- */}
      {isOpen && (
        <div 
           className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
           onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 w-full overflow-x-hidden">
         {children}
      </main>
    </div>
  );
}