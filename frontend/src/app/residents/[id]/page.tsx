'use client';

import React from 'react';
import { 
  Phone, 
  MessageSquare, 
  UserPlus, 
  CheckCircle,
  AlertCircle,
  Mic,
  TrendingDown,
  Smile,
  Frown,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function ResidentDetail() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Kim Mal-soon</h2>
          <p className="text-slate-500 font-medium">82세, 서울 | <span className="text-red-500 font-bold">위험</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="card-premium p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-light/20 rounded-lg"><Mic className="w-5 h-5 text-primary" /></div>
                <h3 className="font-bold text-lg">발화 활동량</h3>
              </div>
              <span className="text-sm text-red-500 font-bold flex items-center gap-1">
                <TrendingDown className="w-4 h-4" /> 15% 감소
              </span>
            </div>
            
            <div className="mb-4">
              <h4 className="text-4xl font-bold text-slate-900">4.2 hrs/day</h4>
              <p className="text-sm text-slate-500 mt-1">Significantly below weekly average</p>
            </div>

            <div className="flex items-end gap-2 h-32 mt-8">
              {[60, 70, 55, 90, 45, 35, 15].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-500 ${i === 6 ? 'bg-red-400' : 'bg-primary'}`} 
                    style={{ height: `${h}%` }} 
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-premium p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg"><Smile className="w-5 h-5 text-orange-600" /></div>
                <h3 className="font-bold text-lg">감정 변화 추이</h3>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-3xl font-bold text-red-500">부정적 변화 감지</h4>
              <p className="text-sm text-slate-500 mt-1">Detected via voice tone analysis</p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold uppercase mb-2">
                  <span className="text-primary">Positive</span>
                  <span className="text-slate-400">15%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold uppercase mb-2">
                  <span className="text-red-500">Negative</span>
                  <span className="text-slate-400">85%</span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <button className="flex flex-col items-center justify-center gap-3 p-6 bg-primary hover:opacity-90 text-white rounded-2xl transition-all shadow-lg shadow-primary/20 group">
              <Phone className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">전화</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl transition-all group">
              <MessageSquare className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">문자 메시지</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl transition-all group">
              <UserPlus className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">방문 필요</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl transition-all group">
              <CheckCircle className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">이상 없음 확인</span>
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="card-premium overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" /> 최근 이상 징후
              </h3>
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">2</span>
            </div>
            <div className="p-2 space-y-2">
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl relative group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Mic className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-red-700">Lee Young-hee</p>
                      <p className="text-[10px] text-red-400">2 mins ago</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 px-1.5 py-0.5 rounded">높음</span>
                </div>
                <p className="text-sm font-bold text-red-900">No speech detected for 24h</p>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Frown className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-orange-700">Park Jung-soo</p>
                      <p className="text-[10px] text-orange-400">15 mins ago</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">중간</span>
                </div>
                <p className="text-sm font-bold text-orange-900">Sudden negative emotions detected</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl opacity-60">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-8 h-8 text-slate-300" />
                    <div>
                      <p className="text-xs font-bold text-slate-500">Choi Min-ho</p>
                      <p className="text-[10px] text-slate-400">2 hours ago</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">RESOLVED</span>
                </div>
                <p className="text-sm font-medium text-slate-500">Missed morning check-in</p>
              </div>
            </div>
            <button className="w-full p-4 text-sm font-bold text-primary hover:bg-primary-light/10 transition-colors border-t border-slate-100">
              모든 알림 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
