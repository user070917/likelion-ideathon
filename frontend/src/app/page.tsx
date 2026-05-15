'use client';
import React from 'react';
import {
  Users,
  Bell,
  MicOff,
  FileText,
  Plus
} from 'lucide-react';
import KpiCard from '@/components/dashboard/KpiCard';
import ResidentTable from '@/components/dashboard/ResidentTable';

export default function Dashboard() {
  const [activeResident, setActiveResident] = React.useState<any>(null);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">노인 개요</h2>
          <p className="text-sm md:text-base text-slate-500 font-medium">모든 노인분들에 대한 실시간 건강 및 발화 모니터링.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase">마지막 업데이트: 방금 전</span>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> 신규 입주자 추가
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="전체 대상자"
          value="128"
          icon={Users}
          iconBg="bg-primary-light/20"
          iconColor="text-primary"
        />
        <KpiCard
          title="오늘의 알림"
          value="12"
          delta="+3"
          deltaType="negative"
          icon={Bell}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
        />
        <KpiCard
          title="무발화 (>24h)"
          value="5"
          icon={MicOff}
          iconBg="bg-red-50"
          iconColor="text-red-500"
        />
        <KpiCard
          title="미확인 보고서"
          value="3"
          icon={FileText}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
        />
      </div>

      <div className="w-full">
        <ResidentTable onSelectResident={setActiveResident} />
      </div>
    </div>
  );

}
