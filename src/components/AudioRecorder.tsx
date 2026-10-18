"use client";

import { useRef, useState, useEffect } from "react";

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob | null, audioUrl: string | null) => void;
}

export default function AudioRecorder({ onAudioReady }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const [errorMsg, setErrorMsg] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

  const startRecording = async () => {
    setErrorMsg("");
    setIsRequesting(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Sizning brauzeringiz mikrofonga ruxsat bermayapti yoki xavfsiz (HTTPS) emas.");
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current);
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
        onAudioReady(blob, url);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setIsRequesting(false);
      startTimer();
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Mikrofonga ruxsat berilmadi yoki qandaydir xatolik yuz berdi. (Ruxsat so'ralganda 'Allow' ni bosing)");
      setIsRequesting(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
    }
  };

  const deleteRecording = () => {
    setRecordedBlob(null);
    setRecordedUrl(null);
    setDuration(0);
    setIsPlaying(false);
    setCurrentTime(0);
    onAudioReady(null, null);
    if (audioRef.current) audioRef.current.pause();
  };

  const togglePlay = () => {
    if (!audioRef.current || !recordedUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (recordedUrl && audioRef.current) {
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      audioRef.current.ontimeupdate = () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      };
      audioRef.current.onloadedmetadata = () => {
        setAudioDuration(audioRef.current?.duration || 0);
      };
    }
  }, [recordedUrl]);

  useEffect(() => {
    if (duration >= 180 && isRecording) stopRecording();
  }, [duration, isRecording]);

  return (
    <div className="w-full sm:w-[320px]">
      <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">Audio</label>
      <div className="bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-transparent rounded-2xl p-4 transition-colors shadow-sm dark:shadow-none">
        {errorMsg && (
          <div className="text-yellow-400 dark:text-yellow-500 text-xs font-bold bg-yellow-50 dark:bg-yellow-500/10 p-2 rounded-lg mb-2 border border-yellow-200 dark:border-yellow-500/20">
            {errorMsg}
          </div>
        )}
        {!recordedBlob ? (
          <div className="flex items-center gap-4">
            {isRecording ? (
              <>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-10 h-10 rounded-full bg-yellow-500 hover:bg-yellow-400 text-white flex items-center justify-center transition shrink-0 shadow-md"
                >
                  <div className="w-3 h-3 bg-white rounded-sm"></div>
                </button>
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shrink-0" />
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-300 tabular-nums">
                    {formatTime(duration)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isRequesting}
                  onClick={(e) => {
                    e.preventDefault();
                    startRecording();
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition shrink-0 shadow-sm ${isRequesting ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500' : 'bg-yellow-400 hover:bg-yellow-500 text-black shadow-md'}`}
                >
                  {isRequesting ? (
                    <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                      <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                    </svg>
                  )}
                </button>
                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  {isRequesting ? "Ruxsat kutilmoqda..." : "Audio yozish uchun bosing"}
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {recordedUrl && (
              <audio ref={audioRef} src={recordedUrl} className="hidden" />
            )}
            <button
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black flex items-center justify-center transition shrink-0 shadow-md"
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                <span>{formatTime(Math.floor(currentTime))}</span>
                <span>{formatTime(Math.floor(audioDuration || duration))}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all"
                  style={{ width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : "0%" }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={deleteRecording}
              className="w-8 h-8 rounded-full text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 flex items-center justify-center transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
