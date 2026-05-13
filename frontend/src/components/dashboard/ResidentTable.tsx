'use client';

import React, { useEffect, useState } from 'react';
import { MoreHorizontal, MessageSquare, AlertCircle, CheckCircle2, Mic } from 'lucide-react';
import { userService } from '@/api';
import VoiceRecordModal from './VoiceRecordModal';

interface Resident {
  id: string;
  name: string;
  age: number;
  gender: string;
  status: 'normal' | 'warning' | 'danger';
  ward: string;
  lastSpeech: string;
  aiSummary: string;
}

export default function ResidentTable() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const data = await userService.getUsers();
        const mappedData = data.map((user: any) => ({
          ...user,
          ward: '북측 병동',
          status: user.name === 'Eleanor Vance' ? 'danger' : 'normal',
          lastSpeech: '방금 전',
          aiSummary: user.name === 'Eleanor Vance' ? '잦은 우울감 표현' : '특이사항 없음'
        }));
        setResidents(mappedData);
      } catch (error) {
        console.error('Failed to fetch residents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResidents();
  }, []);

  if (loading) {
    return <div className="card-premium p-10 text-center text-slate-500 font-medium">데이터 로딩 중...</div>;
  }

  return (
    <div className="card-premium overflow-hidden relative">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-lg text-slate-900">입주자 모니터</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50">필터</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">성함 및 ID</th>
              <th className="px-6 py-4">지역</th>
              <th className="px-6 py-4">상태</th>
              <th className="px-6 py-4">마지막 발화</th>
              <th className="px-6 py-4">AI 요약</th>
              <th className="px-6 py-4 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {residents.map((resident) => (
              <tr key={resident.id} className="hover:bg-primary-light/10 transition-colors cursor-pointer group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {resident.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{resident.name}</p>
                      <p className="text-xs text-slate-500">ID: {resident.id.toString().slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-600">{resident.ward}</p>
                </td>
                <td className="px-6 py-4">
                  {resident.status === 'danger' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold">
                      <AlertCircle className="w-3 h-3" /> 위험
                    </span>
                  )}
                  {resident.status === 'warning' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold">
                      <AlertCircle className="w-3 h-3" /> 주의
                    </span>
                  )}
                  {resident.status === 'normal' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold">
                      <CheckCircle2 className="w-3 h-3" /> 정상
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{resident.lastSpeech}</td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-600 truncate max-w-[150px]">{resident.aiSummary}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={() => setSelectedResident(resident)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all shadow-sm hover:shadow-md"
                      title="음성 분석 시작"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold whitespace-nowrap">음성 분석</span>
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selectedResident && (
        <VoiceRecordModal 
          userId={selectedResident.id}
          userName={selectedResident.name}
          onClose={() => setSelectedResident(null)}
          onSuccess={(analysis) => {
            console.log('Analysis result received:', analysis);
          }}
        />
      )}

      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{residents.length}개 항목 중 1~{residents.length}번째 표시</span>
        <div className="flex gap-2">
          <button className="p-1 hover:bg-slate-100 rounded border border-slate-200">{'<'}</button>
          <button className="p-1 hover:bg-slate-100 rounded border border-slate-200">{'>'}</button>
        </div>
      </div>
    </div>
  );
}
