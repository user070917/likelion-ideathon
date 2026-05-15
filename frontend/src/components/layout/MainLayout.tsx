'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-500 ease-in-out",
        isSidebarOpen ? "lg:pl-64" : "lg:pl-20",
        "pl-0"
      )}>
        <Header onMenuClick={toggleSidebar} />
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
