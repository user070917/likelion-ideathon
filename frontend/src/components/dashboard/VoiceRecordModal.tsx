'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, X, CheckCircle, MessageCircle } from 'lucide-react';
import { analysisService, userService, carebotService } from '@/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VoiceRecordModalProps {
  userId: string;
  userName: string;
  isAiCall?: boolean;
  isCareBot?: boolean;
  onClose: () => void;
  onSuccess?: (analysis: any) => void;
}

export default function VoiceRecordModal({ userId, userName, isAiCall, isCareBot, onClose, onSuccess }: VoiceRecordModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlayingAi, setIsPlayingAi] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [aiText, setAiText] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: 'ai' | 'resident', text: string }[]>([]);
  const [result, setResult] = useState<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextStepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initiatedRef = useRef(false);
  const isMountedRef = useRef(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 스크롤 하단 고정
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isPlayingAi, isRecording]);

  useEffect(() => {
    isMountedRef.current = true;
    if (initiatedRef.current) return;
    initiatedRef.current = true;

    if (isAiCall || isCareBot) {
      handleAiInitiation();
    } else {
      startRecording();
    }
    return () => {
      isMountedRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (nextStepTimerRef.current) clearTimeout(nextStepTimerRef.current);
      stopRecording();
    };
  }, []);

  const handleAiInitiation = async (currentHistory?: { role: 'ai' | 'resident', text: string }[]) => {
    try {
      setIsInitializing(true);
      setIsPlayingAi(true);
      let audioBlob, text;

      const activeHistory = currentHistory || chatHistory;

      // Both isAiCall and isCareBot now use the same unified logic on the backend
      if (isCareBot || isAiCall) {
        if (activeHistory.length > 0) {
          const history = activeHistory.map(h => ({ role: h.role, text: h.text }));
          const result = await carebotService.talk(history, userId);
          audioBlob = result.audioBlob;
          text = result.text;
        } else {
          // Initial greeting
          const result = await userService.getGreeting(userId);
          audioBlob = result.audioBlob;
          text = result.text;
        }
      } else {
        setIsPlayingAi(false);
        return;
      }

      // JSON parsing for unified assessment result
      let displayText = text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedJson = JSON.parse(jsonMatch[0]);
          setResult(parsedJson); 
          displayText = text.replace(jsonMatch[0], '').trim();
        } catch (e) {
          console.error("JSON parse error", e);
        }
      }

      setAiText(displayText);
      if (displayText) {
        setChatHistory(prev => [...prev, { role: 'ai', text: displayText }]);
      }

      const url = URL.createObjectURL(audioBlob);
      if (!isMountedRef.current) {
        URL.revokeObjectURL(url);
        return;
      }

      setIsInitializing(false);
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => {
        if (!isMountedRef.current) {
          URL.revokeObjectURL(url);
          return;
        }
        setIsPlayingAi(false);
        URL.revokeObjectURL(url);
        // Continue recording only if assessment hasn't been generated yet
        if (!jsonMatch) {
          nextStepTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) startRecording();
          }, 500);
        }
      };

      await audio.play();
    } catch (err) {
      console.error('AI Initiation failed:', err);
      setIsPlayingAi(false);
      setIsInitializing(false);
    }
  };

  const startRecording = async () => {
    if (!isMountedRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      if (!isMountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkSilence = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;

        // Increased threshold to ignore background noise (from 10 to 20)
        if (average < 20) {
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => stopRecording(), 3000); 
          }
        } else {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }
        requestAnimationFrame(checkSilence);
      };

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
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
      };

      mediaRecorder.start();
      setIsRecording(true);
      checkSilence();
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  const handleUpload = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const response = await analysisService.uploadAudio(userId, file);
      if (!isMountedRef.current) return;
      
      const updatedHistory: { role: 'ai' | 'resident', text: string }[] = [...chatHistory, { role: 'resident', text: response.text }];
      setChatHistory(updatedHistory);
      setResult(response);
      handleAiInitiation(updatedHistory);
    } catch (err) {
      console.error('Analysis failed:', err);
      alert('분석에 실패했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center sm:p-4 p-0">
      <div className="bg-white sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden flex flex-col sm:h-[600px] h-full">
        <div className="p-6 border-b flex justify-between items-center bg-primary text-white flex-shrink-0">
          <h3 className="font-bold text-base sm:text-lg">
            {isCareBot ? `${userName}님 인지 스크리닝` : `${userName}님과 대화 중`}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {chatHistory.length === 0 && !isPlayingAi && !isRecording && (
            <div className="text-center py-20 text-slate-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>대화를 시작해 보세요.</p>
            </div>
          )}
          
          {chatHistory.map((chat, idx) => (
            <div key={idx} className={cn("flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300", chat.role === 'ai' ? "justify-start" : "justify-end")}>
              <div className={cn(
                "max-w-[85%] p-3 sm:p-4 rounded-2xl text-xs sm:text-sm shadow-sm",
                chat.role === 'ai' 
                  ? "bg-white text-slate-800 rounded-tl-none border border-slate-100" 
                  : "bg-primary text-white rounded-tr-none"
              )}>
                {chat.text}
              </div>
            </div>
          ))}
          
          {(isAnalyzing || isPlayingAi || isRecording || isInitializing) && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-xs text-slate-400 italic">
                <Loader2 className="w-3 h-3 animate-spin" />
                {isInitializing ? "AI가 대화를 준비 중..." : 
                 isAnalyzing ? "어르신의 말씀을 분석 중..." : 
                 isPlayingAi ? "AI가 대답하는 중..." : 
                 "어르신의 말씀을 듣는 중..."}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-white space-y-3 flex-shrink-0">
          <button
            onClick={isRecording ? stopRecording : (isPlayingAi || isAnalyzing ? undefined : startRecording)}
            disabled={isPlayingAi || isAnalyzing}
            className={cn(
              "w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2",
              isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-primary hover:bg-primary/90",
              (isPlayingAi || isAnalyzing) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isRecording ? (
              <><Square className="w-5 h-5 fill-current" /> 말씀 중지 (자동 저장)</>
            ) : isPlayingAi || isInitializing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {isInitializing ? "AI 대화 준비 중..." : "AI 답변 중..."}</>
            ) : isAnalyzing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> 분석 중...</>
            ) : (
              <><Mic className="w-5 h-5" /> 말씀 나누기 시작</>
            )}
          </button>
          
          {chatHistory.length > 1 && (
            <button
              onClick={() => {
                if (result && onSuccess) onSuccess(result);
                onClose();
              }}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" /> 대화 종료 및 결과 저장
            </button>
          )}
          
          <p className="text-[10px] text-center text-slate-400 font-medium">
            {isRecording ? "말씀을 마치시면 3초 후 자동으로 다음으로 넘어갑니다." : "대화가 충분히 이루어지면 '대화 종료'를 눌러주세요."}
          </p>
        </div>
      </div>
    </div>
  );
}
