'use client';

import React from 'react';
import { User, Phone, MessageSquare, MapPin, Activity, Heart, Info } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

const data = [
  { time: '00:00', value: 10 },
  { time: '04:00', value: 5 },
  { time: '08:00', value: 45 },
  { time: '12:00', value: 30 },
  { time: '16:00', value: 65 },
  { time: '20:00', value: 20 },
  { time: '23:59', value: 15 },
];

export default function ResidentPanel() {
  return (
    <div className="flex flex-col gap-6">
      <div className="card-premium p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xl text-slate-900">Arthur Pendelton</h3>
              <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider">주의</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
              <MapPin className="w-3 h-3" />
              <span>동측 병동, 302호</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">나이</p>
            <p className="text-lg font-bold text-slate-800">84</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">주 연락처</p>
            <p className="text-sm font-bold text-slate-800">Sarah P. (딸)</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> 발화 음량 추이
              </h4>
              <span className="text-[10px] text-slate-400 font-medium uppercase">최근 24시간</span>
            </div>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#618B35" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#618B35" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#618B35" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1 justify-center">
              ↘ 유의미한 감소 감지됨
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-pink-500" />
              <h4 className="font-bold text-slate-900">AI 문맥 분석</h4>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-600 leading-relaxed mb-4 italic">
                "최근 발화 패턴은 위축되는 경향을 보입니다. 식별된 마커:"
              </p>
              <div className="flex flex-wrap gap-2">
                {['외로움', '불안', '피로'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button className="w-full bg-primary hover:opacity-90 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20">
            <MessageSquare className="w-5 h-5" />
            체크인 프로토콜 시작
          </button>
        </div>
      </div>

      <div className="bg-primary rounded-2xl p-6 text-white overflow-hidden relative group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" /> 시스템 가이드
        </h4>
        <p className="text-sm text-white/80 leading-relaxed">
          AI 분석 결과는 보조 도구입니다. 정서적 위축이 감지되면 즉시 대면 상담을 권장합니다.
        </p>
      </div>
    </div>
  );
}
