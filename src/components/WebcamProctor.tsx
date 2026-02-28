import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Eye } from 'lucide-react';

export interface Snapshot {
  id: string;
  timestamp: string;
  dataUrl: string;
}

interface WebcamProctorProps {
  /** Interval between snapshots in milliseconds (default: 30000 = 30s) */
  intervalMs?: number;
  /** Whether proctoring is active */
  active?: boolean;
  /** Callback when a new snapshot is captured */
  onSnapshot?: (snapshot: Snapshot) => void;
  /** Callback when webcam access fails */
  onError?: (error: string) => void;
}

const WebcamProctor = ({
  intervalMs = 30000,
  active = true,
  onSnapshot,
  onError,
}: WebcamProctorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [snapshotCount, setSnapshotCount] = useState(0);
  const [lastCaptureTime, setLastCaptureTime] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

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

  // Capture snapshot
  const captureSnapshot = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);

    const snapshot: Snapshot = {
      id: `SNAP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      dataUrl,
    };

    setSnapshotCount(prev => prev + 1);
    setLastCaptureTime(new Date().toLocaleTimeString());
    onSnapshot?.(snapshot);
  }, [cameraReady, onSnapshot]);

  // Periodic capture
  useEffect(() => {
    if (!cameraReady || !active) return;

    // Capture immediately on start
    const initialTimeout = setTimeout(() => captureSnapshot(), 2000);
    const interval = setInterval(captureSnapshot, intervalMs);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [cameraReady, active, intervalMs, captureSnapshot]);

  return (
    <>
      {/* Hidden video and canvas for capture */}
      <video ref={videoRef} className="hidden" muted playsInline />
      <canvas ref={canvasRef} className="hidden" />

      {/* Compact status indicator */}
      <div className="flex items-center gap-2">
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

        {/* Live preview popover */}
        {showPreview && cameraReady && (
          <div className="absolute top-12 right-0 z-50 bg-card border border-border rounded-lg p-2 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-3 h-3 text-primary" />
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                Proctor Feed
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse ml-auto" />
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

      {/* Camera error banner */}
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
