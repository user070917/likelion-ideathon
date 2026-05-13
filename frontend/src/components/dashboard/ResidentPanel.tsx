'use client';

import React from 'react';
import { User, Phone, MessageSquare, MapPin, Activity, Heart, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const data = [
  { time: '00:00', value: 10 },
  { time: '04:00', value: 5 },
  { time: '08:00', value: 45 },
  { time: '12:00', value: 30 },
  { time: '16:00', value: 65 },
  { time: '20:00', value: 20 },
  { time: '23:59', value: 15 },
];

interface ResidentPanelProps {
  resident: any;
}

export default function ResidentPanel({ resident }: ResidentPanelProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!resident) {
    return (
      <div className="card-premium p-8 h-full flex flex-col items-center justify-center text-center bg-white/50 border-dashed border-2 border-slate-200">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="font-bold text-slate-900 mb-2">실시간 모니터링</h3>
        <p className="text-sm text-slate-500">입주자 목록에서 어르신을 선택하시면<br/>상세 분석 데이터를 확인할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card-premium p-6 bg-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl font-bold text-primary">
            {resident.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xl text-slate-900">{resident.name}님</h3>
              {resident.status === 'danger' ? (
                <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider">위험</span>
              ) : resident.status === 'warning' ? (
                <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider">주의</span>
              ) : resident.status === 'normal' ? (
                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider">정상</span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">미등록</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
              <MapPin className="w-3 h-3" />
              <span>{resident.ward}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">나이 / 성별</p>
            <p className="text-sm font-bold text-slate-800">{resident.age}세 / {resident.gender === 'female' ? '여성' : '남성'}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">마지막 발화</p>
            <p className="text-sm font-bold text-slate-800">{resident.lastSpeech}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> 실시간 발화량 추이
              </h4>
              <span className="text-[10px] text-slate-400 font-medium uppercase">최근 24시간</span>
            </div>
            <div className="h-[120px] w-full min-h-[120px]">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={resident.status === 'danger' ? '#EF4444' : '#618B35'} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={resident.status === 'danger' ? '#EF4444' : '#618B35'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke={resident.status === 'danger' ? '#EF4444' : '#618B35'} strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
              )}
            </div>
            <p className={cn(
              "text-[10px] font-bold mt-2 flex items-center gap-1 justify-center",
              resident.status === 'danger' ? "text-red-500" : "text-slate-400"
            )}>
              {resident.status === 'danger' ? '↘ 유의미한 감소 감지됨' : '→ 안정적인 패턴 유지 중'}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-pink-500" />
              <h4 className="font-bold text-slate-900">AI 정서 분석 요약</h4>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-600 leading-relaxed mb-4 italic">
                "{resident.aiSummary}"
              </p>
              <div className="flex flex-wrap gap-2">
                {(resident.status === 'danger' || resident.status === 'warning') ? 
                  ['불안', '위축', '피로'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600">
                      {tag}
                    </span>
                  )) : 
                  ['안정', '긍정', '활발'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600">
                      {tag}
                    </span>
                  ))
                }
              </div>
            </div>
          </div>

          <button className="w-full bg-primary hover:opacity-90 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20">
            <MessageSquare className="w-5 h-5" />
            실시간 체크인 시작
          </button>
        </div>
      </div>

      <div className="bg-primary rounded-2xl p-6 text-white overflow-hidden relative group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" /> 모니터링 가이드
        </h4>
        <p className="text-sm text-white/80 leading-relaxed">
          어르신의 발화 패턴 변화는 정서적 상태의 중요한 지표입니다. 위험 배지가 뜨면 즉시 대화를 시도해 주세요.
        </p>
      </div>
    </div>
  );
}
