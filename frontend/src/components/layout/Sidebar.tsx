'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  Bell, 
  Users, 
  Settings, 
  LogOut,
  ShieldCheck,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: LayoutDashboard, label: '개요', href: '/' },
  { icon: BarChart3, label: '통계 분석', href: '/analytics' },
  { icon: Bell, label: '알림 히스토리', href: '/alerts' },
  { icon: Users, label: '대상자 명단', href: '/residents' },
];

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "h-screen bg-[var(--sidebar)] text-white flex flex-col fixed left-0 top-0 z-50 transition-all duration-500 ease-in-out shadow-2xl overflow-hidden",
      isOpen ? "w-64" : "w-20"
    )}>
      <div className={cn(
        "flex flex-col items-center py-6 transition-all duration-500 ease-in-out",
        isOpen ? "px-6 items-stretch" : "px-0"
      )}>
        <div className={cn(
          "flex items-center transition-all duration-500",
          isOpen ? "justify-between gap-3" : "flex-col gap-6"
        )}>
          <div className={cn(
            "flex items-center flex-shrink-0",
            isOpen ? "gap-3" : "gap-0"
          )}>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-white/20 flex-shrink-0 overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover scale-125" />
            </div>
            <h1 className={cn(
              "font-black text-2xl text-white tracking-tight transition-all duration-500 overflow-hidden whitespace-nowrap",
              isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
            )}>늘봄</h1>
          </div>
          
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white flex-shrink-0"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-link",
                isActive && "sidebar-link-active",
                !isOpen && "justify-center px-0"
              )}
              title={!isOpen ? item.label : ""}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-white/50")} />
              {isOpen && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/10">
        <button className={cn("sidebar-link w-full", !isOpen && "justify-center px-0")}>
          <Settings className="w-5 h-5 text-white/50 flex-shrink-0" />
          {isOpen && <span>Settings</span>}
        </button>
        <button className={cn("sidebar-link w-full text-red-200 hover:bg-red-500/20 hover:text-white", !isOpen && "justify-center px-0")}>
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
