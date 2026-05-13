'use client';

import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, X, CheckCircle } from 'lucide-react';
import { analysisService } from '@/api';

interface VoiceRecordModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onSuccess?: (analysis: any) => void;
}

export default function VoiceRecordModal({ userId, userName, onClose, onSuccess }: VoiceRecordModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        await handleUpload(audioFile);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleUpload = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const response = await analysisService.uploadAudio(userId, file);
      setResult(response);
      if (onSuccess) onSuccess(response);
    } catch (err) {
      console.error('Analysis failed:', err);
      alert('분석에 실패했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-primary text-white">
          <h3 className="font-bold text-lg">{userName}님 음성 분석</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          {!result && !isAnalyzing && (
            <>
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${isRecording ? 'bg-red-100 scale-110 animate-pulse' : 'bg-primary/10'}`}>
                <Mic className={`w-10 h-10 ${isRecording ? 'text-red-500' : 'text-primary'}`} />
              </div>
              <h4 className="text-xl font-bold mb-2">
                {isRecording ? '말씀을 듣고 있습니다...' : '음성 녹음 시작'}
              </h4>
              <p className="text-slate-500 mb-8 text-sm">
                {isRecording ? '말씀을 마치시면 중지 버튼을 눌러주세요.' : '아래 버튼을 눌러 어르신과의 대화를 녹음하세요.'}
              </p>
              
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
              >
                {isRecording ? (
                  <span className="flex items-center justify-center gap-2"><Square className="w-5 h-5 fill-current" /> 녹음 중지</span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><Mic className="w-5 h-5" /> 녹음 시작</span>
                )}
              </button>
            </>
          )}

          {isAnalyzing && (
            <div className="py-12">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
              <h4 className="text-xl font-bold mb-2 text-slate-800">AI 분석 중...</h4>
              <p className="text-slate-500 text-sm italic">"Whisper STT 및 감정 분석 모델 작동 중"</p>
            </div>
          )}

          {result && (
            <div className="w-full text-left">
              <div className="flex items-center gap-3 mb-6 bg-green-50 p-4 rounded-xl border border-green-100">
                <CheckCircle className="text-green-500 w-6 h-6 flex-shrink-0" />
                <p className="text-green-800 font-medium">분석이 완료되었습니다.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">인식된 텍스트</label>
                  <p className="mt-1 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed border border-slate-100">
                    "{result.text}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <label className="text-[10px] font-bold text-blue-400 uppercase">감정 상태</label>
                    <p className="text-lg font-bold text-blue-700">{result.analysis.emotion === 'sad' ? '슬픔' : '안정'}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <label className="text-[10px] font-bold text-red-400 uppercase">우울 위험도</label>
                    <p className="text-lg font-bold text-red-700">{result.analysis.depression_risk}%</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all"
              >
                닫기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
