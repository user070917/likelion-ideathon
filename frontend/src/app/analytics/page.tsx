'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  BarChart as BarIcon,
  Download,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from 'recharts';

const statusData = [
  { name: '정상', value: 70, color: '#618B35' },
  { name: '주의', value: 20, color: '#f59e0b' },
  { name: '위험', value: 10, color: '#ef4444' },
];

const wardData = [
  { name: '북부', value: 35 },
  { name: '남부', value: 28 },
  { name: '동부', value: 45 },
  { name: '서부', value: 30 },
  { name: '중부', value: 20 },
  { name: '밸리', value: 15 },
];

const trendData = [
  { day: 'Mon', value: 4.5 },
  { day: 'Tue', value: 4.8 },
  { day: 'Wed', value: 4.2 },
  { day: 'Thu', value: 5.1 },
  { day: 'Fri', value: 4.7 },
  { day: 'Sat', value: 3.9 },
  { day: 'Sun', value: 3.5 },
];

export default function Analytics() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">통계 분석 개요</h2>
          <p className="text-slate-500 font-medium">시스템 전반의 성능 및 거주자 건강 지표.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" /> 보고서 내보내기
          </button>
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20">
            <Calendar className="w-4 h-4" /> 최근 30일
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-light/20 rounded-lg"><TrendingUp className="w-5 h-5 text-primary" /></div>
            <p className="text-sm font-bold text-slate-500">대응률</p>
          </div>
          <h3 className="text-4xl font-bold text-slate-900 mb-2">95%</h3>
          <p className="text-sm text-green-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> 지난주 대비 +2%
          </p>
        </div>
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 rounded-lg"><TrendingDown className="w-5 h-5 text-orange-600" /></div>
            <p className="text-sm font-bold text-slate-500">평균 대응 시간</p>
          </div>
          <h3 className="text-4xl font-bold text-slate-900 mb-2">15m</h3>
          <p className="text-sm text-primary font-bold flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> 지난주 대비 -3분
          </p>
        </div>
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-100 rounded-lg"><PieIcon className="w-5 h-5 text-slate-600" /></div>
            <p className="text-sm font-bold text-slate-500">상태 분포</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">324</p>
              <p className="text-xs text-slate-400 font-bold uppercase">전체</p>
            </div>
            <div className="text-[10px] font-bold text-slate-500 space-y-1">
              {statusData.map(s => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name} ({s.value}%)
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-premium p-8">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <BarIcon className="w-5 h-5 text-primary" /> 지역별 이상 징후 빈도
            </h4>
            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">주간 보기</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#618B35" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium p-8">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> 주간 평균 발화 추이
            </h4>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="value" stroke="#618B35" strokeWidth={4} dot={{ fill: '#618B35', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
