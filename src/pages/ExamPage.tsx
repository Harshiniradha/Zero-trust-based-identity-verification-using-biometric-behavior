import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '@/context/ExamContext';
import { examQuestions } from '@/data/mockData';
import { captureKeystrokeProfile, compareProfiles, calculateRiskIncrease, KeyEvent, MouseEvent2 } from '@/lib/keystrokeAnalyzer';
import { Shield, AlertTriangle, Clock, Activity, Mouse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ViolationOverlay from '@/components/ViolationOverlay';
import WebcamProctor, { Snapshot } from '@/components/WebcamProctor';

const ExamPage = () => {
  const { currentUser, addViolationLog, startSession, updateSessionRisk, terminateSession, logout } = useExam();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [riskScore, setRiskScore] = useState(0);
  const [violated, setViolated] = useState(false);
  const [violationReason, setViolationReason] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [mouseSpeed, setMouseSpeed] = useState(0);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const keystrokeBuffer = useRef<KeyEvent[]>([]);
  const mouseBuffer = useRef<MouseEvent2[]>([]);
  const startTimeRef = useRef(Date.now());
  const riskRef = useRef(0);
  const checkStartRef = useRef(performance.now());

  const autoTerminate = useCallback((reason: string) => {
    if (violated) return;
    setViolated(true);
    setViolationReason(reason);

    if (currentUser) {
      addViolationLog({
        userId: currentUser.id,
        userName: currentUser.name,
        reason,
        timestamp: new Date().toISOString(),
        riskScoreAtTermination: riskRef.current,
        sessionDuration: Math.floor((Date.now() - startTimeRef.current) / 1000),
      });
      terminateSession(currentUser.id);
    }

    setTimeout(() => {
      logout();
      navigate('/');
    }, 5000);
  }, [violated, currentUser, addViolationLog, terminateSession, logout, navigate]);

  // Start session
  useEffect(() => {
    if (currentUser) {
      startSession(currentUser.id, currentUser.name);
      checkStartRef.current = performance.now();
    }
  }, [currentUser, startSession]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fullscreen
  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
    return () => { document.exitFullscreen?.().catch(() => {}); };
  }, []);

  // Disable right-click, copy, paste
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', prevent);
    document.addEventListener('copy', prevent);
    document.addEventListener('paste', prevent);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'p'))) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('paste', prevent);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Tab switch / blur detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) autoTerminate('Tab Switch Detected');
    };
    const handleBlur = () => autoTerminate('Window Blur Detected');
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, [autoTerminate]);

  // Keystroke monitoring
  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      keystrokeBuffer.current.push({ key: e.key, type: 'down', timestamp: performance.now() });
    };
    const handleUp = (e: KeyboardEvent) => {
      keystrokeBuffer.current.push({ key: e.key, type: 'up', timestamp: performance.now() });
    };
    document.addEventListener('keydown', handleDown);
    document.addEventListener('keyup', handleUp);
    return () => {
      document.removeEventListener('keydown', handleDown);
      document.removeEventListener('keyup', handleUp);
    };
  }, []);

  // Mouse movement monitoring
  useEffect(() => {
    let lastTime = 0;
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const now = performance.now();
      if (now - lastTime > 50) {
        lastTime = now;
        mouseBuffer.current.push({ x: e.clientX, y: e.clientY, timestamp: now });
        // Calculate live mouse speed
        const len = mouseBuffer.current.length;
        if (len > 1) {
          const prev = mouseBuffer.current[len - 2];
          const curr = mouseBuffer.current[len - 1];
          const dx = curr.x - prev.x;
          const dy = curr.y - prev.y;
          const dt = curr.timestamp - prev.timestamp;
          if (dt > 0) setMouseSpeed(Math.round(Math.sqrt(dx * dx + dy * dy) / dt * 1000));
        }
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Periodic biometric check (keystroke + mouse)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentUser?.masterProfile || keystrokeBuffer.current.length < 10) return;

      const durationMs = performance.now() - checkStartRef.current;
      const currentProfile = captureKeystrokeProfile(keystrokeBuffer.current, mouseBuffer.current, durationMs);
      const result = compareProfiles(currentUser.masterProfile, currentProfile);
      const increase = calculateRiskIncrease(result.overallDeviation);
      
      const newRisk = Math.min(riskRef.current + increase, 100);
      riskRef.current = newRisk;
      setRiskScore(newRisk);
      updateSessionRisk(currentUser.id, newRisk, result.overallDeviation);

      if (newRisk >= 100) {
        autoTerminate('Exam Terminated Due To Suspicious Behavior');
      }

      keystrokeBuffer.current = [];
      mouseBuffer.current = [];
      checkStartRef.current = performance.now();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, updateSessionRisk, autoTerminate]);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (currentUser) terminateSession(currentUser.id);
    setTimeout(() => {
      logout();
      navigate('/');
    }, 3000);
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (violated) return <ViolationOverlay reason={violationReason} />;

  if (submitted) {
    const score = examQuestions.reduce((acc, q) => acc + ((answers[q.id] || '').toLowerCase().trim().includes(q.correctAnswer.toLowerCase().trim()) ? 1 : 0), 0);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-slide-up">
          <Shield className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-mono text-foreground">EXAM SUBMITTED</h1>
          <p className="text-muted-foreground font-mono mt-2">Score: {score}/{examQuestions.length}</p>
          <p className="text-xs text-muted-foreground font-mono mt-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-mono text-sm text-foreground font-semibold">SECURE EXAM</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-sm text-foreground">{formatTime(timeElapsed)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mouse className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">{mouseSpeed} px/s</span>
            </div>
            <div className="relative">
              <WebcamProctor
                intervalMs={30000}
                active={!violated && !submitted}
                onSnapshot={(snap) => setSnapshots(prev => [...prev, snap])}
                onError={(err) => console.warn('Webcam proctoring error:', err)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">RISK:</span>
              <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    riskScore < 50 ? 'bg-success' : riskScore < 80 ? 'bg-warning' : 'bg-destructive'
                  }`}
                  style={{ width: `${riskScore}%` }}
                />
              </div>
              <span className={`font-mono text-xs font-bold ${
                riskScore < 50 ? 'text-success' : riskScore < 80 ? 'text-warning' : 'text-destructive'
              }`}>
                {riskScore.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="pt-20 pb-24 px-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <p className="text-xs font-mono text-warning">
            WARNING: Tab switching, window blur, or biometric/mouse mismatch will terminate your session.
          </p>
        </div>

        <div className="space-y-6">
          {examQuestions.map((q, qi) => (
            <div key={q.id} className="bg-card border border-border rounded-lg p-6 animate-slide-up" style={{ animationDelay: `${qi * 0.05}s` }}>
              <p className="font-mono text-sm text-primary mb-1">Question {q.id}</p>
              <p className="text-foreground font-medium mb-4">{q.question}</p>
              <textarea
                value={answers[q.id] || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 5000) {
                    handleAnswerChange(q.id, value);
                  }
                }}
                placeholder="Type your detailed answer here..."
                rows={4}
                maxLength={5000}
                className="w-full p-3 rounded-md border border-border bg-secondary text-foreground font-mono text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
              />
              <p className="text-xs font-mono text-muted-foreground mt-1 text-right">
                {(answers[q.id] || '').length}/5000
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Submit bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">
            {Object.values(answers).filter(a => a.trim().length > 0).length}/{examQuestions.length} answered
          </span>
          <Button onClick={handleSubmit} className="font-mono uppercase tracking-wider">
            Submit Exam
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
