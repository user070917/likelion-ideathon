import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KpiCardProps {
  title: string;
  value: string | number;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export default function KpiCard({ 
  title, 
  value, 
  delta, 
  deltaType = 'neutral',
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary-light/20'
}: KpiCardProps) {
  return (
    <div className="card-premium p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={cn("p-2 rounded-xl", iconBg)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
        {delta && (
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded-full",
            deltaType === 'positive' && "bg-green-50 text-green-600",
            deltaType === 'negative' && "bg-red-50 text-red-600",
            deltaType === 'neutral' && "bg-slate-50 text-slate-600"
          )}>
            {delta}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>
  );
}
