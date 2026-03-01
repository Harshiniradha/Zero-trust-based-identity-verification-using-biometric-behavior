import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '@/context/ExamContext';
import { Shield, Lock, AlertTriangle, Camera, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showCamDialog, setShowCamDialog] = useState(false);
  const [camStatus, setCamStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const { login, setWebcamApproved } = useExam();
  const navigate = useNavigate();
  const authenticatedUserRef = useRef<{ role: string; calibrated: boolean } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = login(email, password);
    if (!user) {
      setError('Invalid credentials. Access denied.');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin');
      return;
    }
    // For students, show webcam permission dialog
    authenticatedUserRef.current = { role: user.role, calibrated: user.calibrated };
    setCamStatus('idle');
    setShowCamDialog(true);
  };

  const requestWebcamPermission = async () => {
    setCamStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Permission granted — stop the stream immediately (no capturing yet)
      stream.getTracks().forEach(track => track.stop());
      setCamStatus('granted');
      setWebcamApproved(true);
    } catch {
      setCamStatus('denied');
    }
  };

  const handleProceed = () => {
    setShowCamDialog(false);
    const user = authenticatedUserRef.current;
    if (user) {
      if (!user.calibrated) {
        navigate('/calibration');
      } else {
        navigate('/exam');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background grid-bg relative overflow-hidden">
      <div className="scanline absolute inset-0 pointer-events-none z-10" />

      <div className="w-full max-w-md mx-4 animate-slide-up relative z-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-primary mb-4 animate-pulse-glow">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-mono text-foreground tracking-tight">
            ZERO TRUST
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            SECURE EXAM PORTAL v2.0
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-lg p-8 glow-primary">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Authentication Required
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@university.edu"
                className="bg-secondary border-border font-mono text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-secondary border-border font-mono text-sm"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-mono text-destructive">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full font-mono uppercase tracking-wider">
              Authenticate
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground font-mono text-center">
              Contact your administrator for access credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Webcam Permission Dialog */}
      <Dialog open={showCamDialog} onOpenChange={(open) => {
        if (!open && camStatus !== 'granted') {
          // If closing without granting, reset
          setShowCamDialog(false);
        }
      }}>
        <DialogContent className="bg-card border-border font-mono max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-mono">
              <Camera className="w-5 h-5 text-primary" />
              Webcam Access Required
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-mono text-sm">
              This exam requires webcam proctoring. Please grant camera access to proceed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {camStatus === 'idle' && (
              <Button
                onClick={requestWebcamPermission}
                className="w-full font-mono uppercase tracking-wider"
              >
                <Camera className="w-4 h-4 mr-2" />
                Allow Camera Access
              </Button>
            )}

            {camStatus === 'requesting' && (
              <div className="flex items-center justify-center gap-2 py-4 text-primary">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Requesting permission...</span>
              </div>
            )}

            {camStatus === 'granted' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-md bg-success/10 border border-success/30">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">Camera access granted</span>
                </div>
                <Button
                  onClick={handleProceed}
                  className="w-full font-mono uppercase tracking-wider"
                >
                  <Camera className="w-4 h-4 mr-2 text-success" />
                  Start Exam
                </Button>
              </div>
            )}

            {camStatus === 'denied' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    Webcam access is required to attend the exam.
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Please enable camera permissions in your browser settings and try again.
                </p>
                <Button
                  onClick={requestWebcamPermission}
                  variant="outline"
                  className="w-full font-mono uppercase tracking-wider"
                >
                  Retry
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
