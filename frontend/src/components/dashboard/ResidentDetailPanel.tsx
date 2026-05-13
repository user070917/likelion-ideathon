'use client';

import React, { useState } from 'react';
import { X, Phone, User, Heart, MapPin, MessageCircle, BarChart3, TrendingUp, Edit2, Save, RotateCcw } from 'lucide-react';
import { userService } from '@/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ResidentDetailPanelProps {
  resident: any;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function ResidentDetailPanel({ resident, onClose, onUpdate }: ResidentDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: resident.name,
    age: resident.age,
    gender: resident.gender || 'female',
    phone_number: resident.phone_number || '',
    address: resident.address || '',
    guardian_phone: resident.guardian_phone || '',
    medical_history: resident.medical_history || '',
  });

  if (!resident) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await userService.updateUser(resident.id, formData);
      setIsEditing(false);
      if (onUpdate) onUpdate();
      alert('정보가 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('Update failed:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-primary text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl">
              {formData.name[0]}
            </div>
            <div>
              {isEditing ? (
                <input
                  className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white font-bold text-lg outline-none focus:bg-white/30 w-50"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <h3 className="font-bold text-xl">{formData.name}님</h3>
              )}
              <div className="flex items-center gap-2 mt-1">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="bg-white/20 border border-white/30 rounded px-2 py-0.5 text-xs text-white outline-none w-14"
                      value={formData.age || ''}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : 0 })}
                    />
                    <select
                      className="bg-white/20 border border-white/30 rounded px-2 py-0.5 text-xs text-white outline-none appearance-none cursor-pointer"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="female" className="text-slate-900">여성</option>
                      <option value="male" className="text-slate-900">남성</option>
                    </select>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-white/70">{formData.age || 0}세</p>
                    <span className="text-white/50">·</span>
                    <p className="text-sm text-white/70">{formData.gender === 'female' ? '여성' : '남성'}</p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 text-sm font-bold whitespace-nowrap"
              >
                <Edit2 className="w-5 h-5" /> 수정
              </button>
            ) : (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3 py-2 bg-white text-primary rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Save className="w-4 h-4" /> 저장
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-2 hover:bg-white/10 rounded-lg text-xs font-bold whitespace-nowrap"
                >
                  취소
                </button>
              </div>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Personal Information Section */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-primary">
              <User className="w-5 h-5" />
              <h4 className="font-bold uppercase tracking-wider text-sm">기본 정보</h4>
            </div>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <EditableInfoItem
                label="연락처"
                value={formData.phone_number}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, phone_number: val })}
                icon={<Phone className="w-3.5 h-3.5" />}
              />
              <EditableInfoItem
                label="주소"
                value={formData.address}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, address: val })}
                icon={<MapPin className="w-3.5 h-3.5" />}
              />
              <EditableInfoItem
                label="보호자 연락처"
                value={formData.guardian_phone}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, guardian_phone: val })}
                icon={<Phone className="w-3.5 h-3.5" />}
              />
              <EditableInfoItem
                label="의료 정보"
                value={formData.medical_history}
                isEditing={isEditing}
                onChange={(val) => setFormData({ ...formData, medical_history: val })}
                icon={<Heart className="w-3.5 h-3.5" />}
              />
            </div>
          </section>

          {/* AI Analysis Trends */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-primary">
              <TrendingUp className="w-5 h-5" />
              <h4 className="font-bold uppercase tracking-wider text-sm">AI 상태 분석 추이</h4>
            </div>
            <div className="space-y-4">
              <div className="p-6 bg-green-50/50 rounded-2xl border border-green-100/50">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-bold text-green-800">최근 정서 분석 요약</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {resident.aiSummary === '특이사항 없음'
                    ? "최근 기록된 발화 데이터가 적어 정밀 분석이 대기 중입니다. 정기적인 대화를 통해 데이터를 수집해 주세요."
                    : resident.aiSummary}
                </p>
              </div>

              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold text-blue-800">일일 발화량 비교</span>
                  </div>
                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">평균 대비 1.1배</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>{formData.name}님</span>
                      <span>약 850 단어</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-slate-400">
                      <span>연령대 평균</span>
                      <span>720 단어</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-slate-400 h-full rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-slate-100">
          <button className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
            특별 모니터링 등록
          </button>
        </div>
      </div>
    </div>
  );
}

function EditableInfoItem({ label, value, isEditing, onChange, icon }: {
  label: string,
  value: string,
  isEditing: boolean,
  onChange: (val: string) => void,
  icon: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-slate-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
      </div>
      {isEditing ? (
        <input
          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm font-semibold text-slate-700 outline-none focus:border-primary"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <p className="text-sm font-semibold text-slate-700 leading-tight">{value || "미등록"}</p>
      )}
    </div>
  );
}
