import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Eye, UserX, Users, User } from 'lucide-react';

export interface Snapshot {
  id: string;
  timestamp: string;
  dataUrl: string;
  facesDetected?: number;
  faceStatus?: 'ok' | 'no_face' | 'multiple_faces';
}

type FaceStatus = 'ok' | 'no_face' | 'multiple_faces' | 'detecting' | 'unsupported';

interface WebcamProctorProps {
  intervalMs?: number;
  active?: boolean;
  onSnapshot?: (snapshot: Snapshot) => void;
  onError?: (error: string) => void;
  onFaceAnomaly?: (status: 'no_face' | 'multiple_faces', count: number) => void;
}

// Extend Window for FaceDetector (Shape Detection API)
declare global {
  interface Window {
    FaceDetector?: new (options?: { maxDetectedFaces?: number; fastMode?: boolean }) => {
      detect: (image: ImageBitmapSource) => Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
    };
  }
}

const WebcamProctor = ({
  intervalMs = 30000,
  active = true,
  onSnapshot,
  onError,
  onFaceAnomaly,
}: WebcamProctorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<InstanceType<NonNullable<typeof window.FaceDetector>> | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [snapshotCount, setSnapshotCount] = useState(0);
  const [lastCaptureTime, setLastCaptureTime] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [faceStatus, setFaceStatus] = useState<FaceStatus>('detecting');
  const [faceCount, setFaceCount] = useState(0);
  const [anomalyStreak, setAnomalyStreak] = useState(0);

  // Initialize FaceDetector
  useEffect(() => {
    if (window.FaceDetector) {
      try {
        detectorRef.current = new window.FaceDetector({ maxDetectedFaces: 5, fastMode: true });
      } catch {
        detectorRef.current = null;
        setFaceStatus('unsupported');
      }
    } else {
      setFaceStatus('unsupported');
    }
  }, []);

  // Start webcam stream
  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraReady(true);
        setCameraError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Camera access denied';
        setCameraError(message);
        onError?.(message);
      }
    };

    startCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setCameraReady(false);
    };
  }, [active, onError]);

  // Detect faces
  const detectFaces = useCallback(async (): Promise<{ count: number; status: FaceStatus }> => {
    if (!detectorRef.current || !videoRef.current) {
      return { count: -1, status: 'unsupported' };
    }
    try {
      const faces = await detectorRef.current.detect(videoRef.current);
      const count = faces.length;
      const status: FaceStatus = count === 0 ? 'no_face' : count > 1 ? 'multiple_faces' : 'ok';
      return { count, status };
    } catch {
      return { count: -1, status: 'unsupported' };
    }
  }, []);

  // Capture snapshot with face detection
  const captureSnapshot = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Run face detection
    const faceResult = await detectFaces();
    setFaceCount(faceResult.count >= 0 ? faceResult.count : 0);
    if (faceResult.status !== 'unsupported') {
      setFaceStatus(faceResult.status);
    }

    // Track anomaly streaks
    if (faceResult.status === 'no_face' || faceResult.status === 'multiple_faces') {
      setAnomalyStreak(prev => {
        const newStreak = prev + 1;
        // Only fire callback after 2 consecutive anomalies to avoid false positives
        if (newStreak >= 2) {
          onFaceAnomaly?.(faceResult.status as 'no_face' | 'multiple_faces', faceResult.count);
        }
        return newStreak;
      });
    } else {
      setAnomalyStreak(0);
    }

    // Draw face indicator boxes on canvas
    if (detectorRef.current && faceResult.count > 0) {
      try {
        const faces = await detectorRef.current.detect(video);
        ctx.strokeStyle = faceResult.count === 1 ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 2;
        faces.forEach(face => {
          const b = face.boundingBox;
          ctx.strokeRect(b.x, b.y, b.width, b.height);
        });
      } catch { /* ignore drawing errors */ }
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
    const snapshot: Snapshot = {
      id: `SNAP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      dataUrl,
      facesDetected: faceResult.count >= 0 ? faceResult.count : undefined,
      faceStatus: faceResult.status !== 'unsupported' && faceResult.status !== 'detecting'
        ? faceResult.status as Snapshot['faceStatus']
        : undefined,
    };

    setSnapshotCount(prev => prev + 1);
    setLastCaptureTime(new Date().toLocaleTimeString());
    onSnapshot?.(snapshot);
  }, [cameraReady, onSnapshot, detectFaces, onFaceAnomaly]);

  // Periodic face detection (faster than snapshot interval)
  useEffect(() => {
    if (!cameraReady || !active || faceStatus === 'unsupported') return;

    const faceCheckInterval = setInterval(async () => {
      const result = await detectFaces();
      if (result.status !== 'unsupported') {
        setFaceCount(result.count);
        setFaceStatus(result.status);
      }
    }, 3000);

    return () => clearInterval(faceCheckInterval);
  }, [cameraReady, active, faceStatus, detectFaces]);

  // Periodic snapshot capture
  useEffect(() => {
    if (!cameraReady || !active) return;
    const initialTimeout = setTimeout(() => captureSnapshot(), 2000);
    const interval = setInterval(captureSnapshot, intervalMs);
    return () => { clearTimeout(initialTimeout); clearInterval(interval); };
  }, [cameraReady, active, intervalMs, captureSnapshot]);

  const faceStatusIcon = () => {
    if (faceStatus === 'unsupported') return null;
    if (faceStatus === 'no_face') return <UserX className="w-3.5 h-3.5 text-destructive" />;
    if (faceStatus === 'multiple_faces') return <Users className="w-3.5 h-3.5 text-warning" />;
    if (faceStatus === 'ok') return <User className="w-3.5 h-3.5 text-success" />;
    return null;
  };

  const faceStatusLabel = () => {
    if (faceStatus === 'unsupported') return null;
    if (faceStatus === 'no_face') return 'NO FACE';
    if (faceStatus === 'multiple_faces') return `${faceCount} FACES`;
    if (faceStatus === 'ok') return 'VERIFIED';
    return 'SCANNING';
  };

  return (
    <>
      <video ref={videoRef} className="hidden" muted playsInline />
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center gap-2">
        {/* Face status badge */}
        {faceStatus !== 'unsupported' && faceStatus !== 'detecting' && (
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
            faceStatus === 'ok'
              ? 'bg-success/10 text-success border border-success/30'
              : faceStatus === 'no_face'
              ? 'bg-destructive/10 text-destructive border border-destructive/30 animate-pulse'
              : 'bg-warning/10 text-warning border border-warning/30 animate-pulse'
          }`}>
            {faceStatusIcon()}
            {faceStatusLabel()}
          </div>
        )}

        <button
          onClick={() => setShowPreview(prev => !prev)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-secondary/80 transition-colors"
          title={showPreview ? 'Hide camera preview' : 'Show camera preview'}
        >
          {cameraError ? (
            <CameraOff className="w-4 h-4 text-destructive" />
          ) : cameraReady ? (
            <Camera className="w-4 h-4 text-success animate-pulse" />
          ) : (
            <Camera className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="font-mono text-xs text-muted-foreground">
            {cameraError ? 'ERR' : `${snapshotCount}`}
          </span>
        </button>

        {showPreview && cameraReady && (
          <div className="absolute top-12 right-0 z-50 bg-card border border-border rounded-lg p-2 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-3 h-3 text-primary" />
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                Proctor Feed
              </span>
              {faceStatus !== 'unsupported' && (
                <span className={`font-mono text-[10px] font-bold ml-auto ${
                  faceStatus === 'ok' ? 'text-success' : faceStatus === 'no_face' ? 'text-destructive' : 'text-warning'
                }`}>
                  {faceStatusLabel()}
                </span>
              )}
              <div className={`w-1.5 h-1.5 rounded-full ${
                faceStatus === 'ok' ? 'bg-success' : faceStatus === 'no_face' ? 'bg-destructive' : 'bg-warning'
              } animate-pulse`} />
            </div>
            <video
              ref={el => {
                if (el && streamRef.current) {
                  el.srcObject = streamRef.current;
                  el.play().catch(() => {});
                }
              }}
              className="w-48 h-36 rounded-md object-cover border border-border"
              muted
              playsInline
            />
            <div className="mt-1.5 flex justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">
                Captures: {snapshotCount}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {lastCaptureTime ?? '—'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Face anomaly warning banner */}
      {cameraReady && anomalyStreak >= 2 && faceStatus !== 'ok' && faceStatus !== 'unsupported' && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-destructive/10 border border-destructive/30 px-4 py-2 rounded-md animate-pulse">
          <p className="font-mono text-xs text-destructive flex items-center gap-2">
            {faceStatus === 'no_face' ? (
              <><UserX className="w-3.5 h-3.5" /> No face detected — ensure you are visible to the camera</>
            ) : (
              <><Users className="w-3.5 h-3.5" /> Multiple faces detected — only the exam taker should be visible</>
            )}
          </p>
        </div>
      )}

      {cameraError && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-destructive/10 border border-destructive/30 px-4 py-2 rounded-md">
          <p className="font-mono text-xs text-destructive flex items-center gap-2">
            <CameraOff className="w-3.5 h-3.5" />
            Webcam unavailable — proctoring disabled
          </p>
        </div>
      )}
    </>
  );
};

export default WebcamProctor;
