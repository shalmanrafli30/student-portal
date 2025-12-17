'use client';

import Sidebar from '@/components/sidebar'; // Import Sidebar yang baru dibuat
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Cek Login Sederhana (Client Side Protection)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return null; // Atau tampilkan loading spinner
  }

  // Bungkus konten dengan Sidebar
  return (
    <Sidebar>
      {children}
    </Sidebar>
  );
}