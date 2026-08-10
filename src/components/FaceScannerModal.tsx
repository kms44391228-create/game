import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, X, RefreshCw, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

interface FaceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveFace: (faceDataUrl: string) => void;
  currentFaceUrl?: string;
}

export const FaceScannerModal: React.FC<FaceScannerModalProps> = ({
  isOpen,
  onClose,
  onSaveFace,
  currentFaceUrl
}) => {
  const [mode, setMode] = useState<'WEBCAM' | 'UPLOAD'>('WEBCAM');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentFaceUrl || '');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen && mode === 'WEBCAM') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('카메라를 연결할 수 없거나 권한이 거부되었습니다. 파일 업로드를 이용해주세요.');
      setMode('UPLOAD');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;

    // Center crop square
    const minDim = Math.min(video.videoWidth, video.videoHeight);
    const startX = (video.videoWidth - minDim) / 2;
    const startY = (video.videoHeight - minDim) / 2;

    ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, 400, 400);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreviewUrl(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (previewUrl) {
      onSaveFace(previewUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-neutral-900 border-2 border-red-500/50 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.3)] flex flex-col relative">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-black italic uppercase text-white tracking-wider">
              파이터 얼굴 스캔 & 등록
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60">
          <button
            onClick={() => setMode('WEBCAM')}
            className={`flex-1 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition ${
              mode === 'WEBCAM'
                ? 'border-red-500 text-red-400 bg-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Camera className="w-4 h-4" /> 웹캠 라이브 스캔
          </button>
          <button
            onClick={() => setMode('UPLOAD')}
            className={`flex-1 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition ${
              mode === 'UPLOAD'
                ? 'border-red-500 text-red-400 bg-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Upload className="w-4 h-4" /> 사진 파일 업로드
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center justify-center gap-4">
          {mode === 'WEBCAM' ? (
            <div className="relative w-64 h-64 bg-neutral-950 rounded-2xl overflow-hidden border-2 border-red-500/40 flex items-center justify-center shadow-inner">
              {previewUrl && !stream ? (
                <img src={previewUrl} alt="Face Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {/* Face Framing Overlay */}
                  <div className="absolute inset-0 border-4 border-dashed border-red-500/50 rounded-full m-8 pointer-events-none animate-pulse" />
                  <div className="absolute top-2 left-2 text-[10px] font-mono text-red-400 bg-black/60 px-2 py-0.5 rounded">
                    FACE_ALIGNMENT_ACTIVE
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-4">
              <div className="w-64 h-64 bg-neutral-950 rounded-2xl overflow-hidden border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center p-4 text-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Uploaded Face" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-neutral-500">
                    <Upload className="w-10 h-10 text-neutral-600 animate-bounce" />
                    <p className="text-xs font-mono">얼굴 사진 파일(JPG/PNG)을 선택하세요</p>
                  </div>
                )}
              </div>

              <label className="cursor-pointer bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2">
                <Upload className="w-4 h-4" /> 사진 파일 선택
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {cameraError && (
            <div className="text-xs font-mono text-red-400 bg-red-950/80 border border-red-800 p-2.5 rounded-lg flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full mt-2">
            {mode === 'WEBCAM' && stream && (
              <button
                onClick={capturePhoto}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-black italic uppercase text-sm rounded-xl tracking-wider shadow-lg flex items-center justify-center gap-2 transition"
              >
                <Camera className="w-4 h-4" /> 캡처하기
              </button>
            )}

            {previewUrl && (
              <button
                onClick={() => {
                  setPreviewUrl('');
                  if (mode === 'WEBCAM') startCamera();
                }}
                className="p-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition"
                title="다시 촬영"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={handleConfirm}
              disabled={!previewUrl}
              className={`flex-1 py-3 font-black italic uppercase text-sm rounded-xl tracking-wider transition flex items-center justify-center gap-2 shadow-lg ${
                previewUrl
                  ? 'bg-white text-black hover:bg-neutral-200'
                  : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-4 h-4" /> 파이터로 등록
            </button>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
