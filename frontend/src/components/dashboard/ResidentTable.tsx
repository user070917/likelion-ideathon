'use client';

import React, { useEffect, useState } from 'react';
import { MoreHorizontal, MessageSquare, AlertCircle, CheckCircle2, Mic, RotateCcw, User, Info, Trash2, ShieldCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { userService } from '@/api';
import VoiceRecordModal from './VoiceRecordModal';
import ResidentDetailPanel from './ResidentDetailPanel';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ResidentTableProps {
  onSelectResident: (resident: any) => void;
}

interface Resident {
  id: string;
  name: string;
  age: number;
  gender: string;
  status: 'normal' | 'warning' | 'danger' | 'unregistered';
  ward: string;
  lastSpeech: string;
  aiSummary: string;
  mmseScore?: number;
  isAiCall?: boolean;
  isCareBot?: boolean;
}

export default function ResidentTable({ onSelectResident }: ResidentTableProps) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [detailResident, setDetailResident] = useState<Resident | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'normal' | 'warning' | 'danger' | 'unregistered'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const itemsPerPage = 6;

  const fetchResidents = async () => {
    try {
      const data = await userService.getUsers();
      const mappedData = data.map((user: any) => {
        // 주소에서 지역 추출 (예: 서울특별시 관악구 -> 관악구)
        const address = user.address || '';
        const parts = address.split(' ');
        let region = '미등록';

        // 보통 2번째 단어가 구 단위 (서울시 관악구...)
        if (parts.length >= 2) {
          region = parts[1];
        } else if (parts.length === 1 && parts[0] !== '') {
          region = parts[0];
        }

        return {
          ...user,
          ward: region,
          age: user.age || 0,
          gender: user.gender || 'female',
          status: user.status || 'unregistered',
          lastSpeech: user.lastSpeech || '기록 없음',
          aiSummary: user.aiSummary || '분석 대기 중'
        };
      });
      setResidents(mappedData);

      // 첫 로드 시 첫 번째 어르신을 자동으로 선택 (선택 사항)
      if (mappedData.length > 0 && !selectedResident) {
        onSelectResident(mappedData[0]);
      }
    } catch (error) {
      console.error('Failed to fetch residents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`${name} 어르신의 정보를 정말 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.`)) {
      try {
        await userService.deleteUser(id);
        fetchResidents(); // 목록 새로고침
        setMenuOpenId(null);
      } catch (error) {
        alert('삭제 중 오류가 발생했습니다.');
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
  }, [filterStatus]);

  useEffect(() => {
    // 외부 클릭 시 메뉴 닫기
    const handleClickOutside = () => setMenuOpenId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredResidents = residents.filter(r =>
    filterStatus === 'all' ? true : r.status === filterStatus
  );

  // 페이지네이션 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedResidents = filteredResidents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);

  if (loading) {
    return <div className="card-premium p-10 text-center text-slate-500 font-medium">데이터 로딩 중...</div>;
  }

  return (
    <div className="card-premium overflow-hidden bg-white">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="font-bold text-lg text-slate-900">입주자 모니터</h3>
        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto whitespace-nowrap scrollbar-hide">
          {(['all', 'normal', 'warning', 'danger', 'unregistered'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                filterStatus === status
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {status === 'all' ? '전체' :
                status === 'normal' ? '정상' :
                  status === 'warning' ? '주의' :
                    status === 'danger' ? '위험' : '미등록'}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto min-h-[450px]">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">성함 및 ID</th>
              <th className="px-6 py-4">지역</th>
              <th className="px-6 py-4">상태</th>
              <th className="px-6 py-4">인지 점수</th>
              <th className="px-6 py-4">마지막 발화</th>
              <th className="px-6 py-4">AI 요약</th>
              <th className="px-6 py-4 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedResidents.length > 0 ? (
              paginatedResidents.map((resident) => (
                <tr
                  key={resident.id}
                  className="hover:bg-primary-light/10 transition-colors cursor-pointer group"
                  onClick={() => onSelectResident(resident)}
                >
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
                    <p className="text-sm text-slate-600 font-medium">{resident.ward}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={resident.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <span className="text-sm font-bold text-slate-700">{resident.mmseScore || 0}</span>
                      <span className="text-[10px] text-slate-400 font-bold">/ 30</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{resident.lastSpeech}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 truncate max-w-[150px]">{resident.aiSummary}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ActionButtons 
                      resident={resident} 
                      onDelete={handleDelete}
                      onDetail={() => setDetailResident(resident)}
                      onAnalyze={() => setSelectedResident(resident)}
                      onCareBot={() => setSelectedResident({ ...resident, isCareBot: true })}
                      menuOpenId={menuOpenId}
                      setMenuOpenId={setMenuOpenId}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <EmptyState />
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-slate-100 min-h-[450px]">
        {paginatedResidents.length > 0 ? (
          paginatedResidents.map((resident) => (
            <div 
              key={resident.id} 
              className="p-4 space-y-4 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              onClick={() => onSelectResident(resident)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                    {resident.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{resident.name}님</h4>
                    <p className="text-[10px] text-slate-400 font-medium tracking-tight">ID: {resident.id.toString().slice(0, 8)}</p>
                  </div>
                </div>
                <StatusBadge status={resident.status} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">지역</p>
                  <p className="text-sm font-semibold text-slate-700">{resident.ward}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">인지 점수</p>
                  <p className="text-sm font-bold text-blue-600">{resident.mmseScore || 0} / 30</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">마지막 발화</p>
                  <p className="text-sm font-semibold text-slate-700">{resident.lastSpeech}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">AI 분석 요약</p>
                <p className="text-xs text-slate-600 line-clamp-2">{resident.aiSummary}</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedResident(resident);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl font-bold text-xs shadow-sm"
                >
                  <Mic className="w-3.5 h-3.5" /> 음성 분석
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedResident({ ...resident, isCareBot: true });
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> AI 안부
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailResident(resident);
                  }}
                  className="p-2.5 bg-slate-100 text-slate-600 rounded-xl"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center relative bg-slate-50/50">
          <div className="flex items-center gap-2 mx-auto">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors text-slate-600"
            >
              이전
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={cn(
                    "w-8 h-8 text-xs font-bold rounded-lg transition-all",
                    currentPage === num
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors text-slate-600"
            >
              다음
            </button>
          </div>

          <p className="absolute right-6 text-xs text-slate-400 font-bold hidden md:block">
            전체 <span className="text-primary">{filteredResidents.length}</span>개 항목 표시 중
          </p>
        </div>
      )}

      {selectedResident && (
        <VoiceRecordModal 
          userId={selectedResident.id}
          userName={selectedResident.name}
          isAiCall={selectedResident.isAiCall}
          isCareBot={selectedResident.isCareBot}
          onClose={() => setSelectedResident(null)}
          onSuccess={(analysis: any) => {
            fetchResidents();
          }}
        />
      )}

      {detailResident && (
        <ResidentDetailPanel
          resident={detailResident}
          onClose={() => setDetailResident(null)}
          onUpdate={fetchResidents}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Resident['status'] }) {
  switch (status) {
    case 'danger':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold">
          <AlertCircle className="w-3 h-3" /> 위험
        </span>
      );
    case 'warning':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold">
          <AlertCircle className="w-3 h-3" /> 주의
        </span>
      );
    case 'normal':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold">
          <CheckCircle2 className="w-3 h-3" /> 정상
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
          <RotateCcw className="w-3 h-3" /> 미등록
        </span>
      );
  }
}

function ActionButtons({ resident, onDelete, onDetail, onAnalyze, onCareBot, menuOpenId, setMenuOpenId }: any) {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={(e) => { e.stopPropagation(); onAnalyze(); }}
        className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all shadow-sm"
      >
        <Mic className="w-3.5 h-3.5" />
        <span className="text-xs font-bold whitespace-nowrap">음성 분석</span>
      </button>
      
      <button
        onClick={(e) => { e.stopPropagation(); onCareBot(); }}
        className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all shadow-sm"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span className="text-xs font-bold whitespace-nowrap">AI 안부</span>
      </button>
      
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpenId(menuOpenId === resident.id ? null : resident.id);
          }}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {menuOpenId === resident.id && (
          <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1 overflow-hidden animate-in fade-in zoom-in duration-100">
            <button
              onClick={(e) => { e.stopPropagation(); onDetail(); setMenuOpenId(null); }}
              className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Info className="w-3.5 h-3.5" /> 정보보기
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onAnalyze(); setMenuOpenId(null); }}
              className="xl:hidden w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Mic className="w-3.5 h-3.5" /> 음성 분석
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onCareBot(); setMenuOpenId(null); }}
              className="xl:hidden w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5" /> AI 안부
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(resident.id, resident.name); }}
              className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" /> 삭제하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-12 text-center">
      <div className="flex flex-col items-center justify-center text-slate-400">
        <User className="w-12 h-12 mb-3 opacity-20" />
        <p className="font-medium text-sm">해당하는 입주자 정보가 없습니다.</p>
        <p className="text-xs mt-1">필터를 변경하거나 새 데이터를 기다려주세요.</p>
      </div>
    </div>
  );
}
