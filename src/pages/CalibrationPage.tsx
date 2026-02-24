import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '@/context/ExamContext';
import { CALIBRATION_PARAGRAPH } from '@/data/mockData';
import { captureKeystrokeProfile, compareProfiles, KeyEvent } from '@/lib/keystrokeAnalyzer';
import { Fingerprint, CheckCircle, XCircle, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CalibrationPage = () => {
  const { currentUser, updateUserProfile, markCalibrated } = useExam();
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState('');
  const [status, setStatus] = useState<'typing' | 'analyzing' | 'success' | 'fail'>('typing');
  const [message, setMessage] = useState('');
  const keystrokeEvents = useRef<KeyEvent[]>([]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
      keystrokeEvents.current.push({ key: e.key, type: 'down', timestamp: performance.now() });
    }
  }, []);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
      keystrokeEvents.current.push({ key: e.key, type: 'up', timestamp: performance.now() });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTypedText(e.target.value);
  };

  const analyzeProfile = () => {
    if (!currentUser) return;
    setStatus('analyzing');

    const profile = captureKeystrokeProfile(keystrokeEvents.current);

    if (currentUser.masterProfile) {
      const result = compareProfiles(currentUser.masterProfile, profile);
      if (result.match) {
        setStatus('success');
        setMessage(`Identity verified. Deviation: ${(result.overallDeviation * 100).toFixed(1)}%`);
        setTimeout(() => navigate('/exam'), 2000);
      } else {
        setStatus('fail');
        setMessage(`Deviation too high: ${(result.overallDeviation * 100).toFixed(1)}%. Please try again.`);
        setTimeout(() => {
          setStatus('typing');
          setTypedText('');
          keystrokeEvents.current = [];
        }, 3000);
      }
    } else {
      // First calibration — save as master profile
      updateUserProfile(currentUser.id, profile);
      markCalibrated(currentUser.id);
      setStatus('success');
      setMessage('Biometric profile created successfully. Redirecting to exam...');
      setTimeout(() => navigate('/exam'), 2000);
    }
  };

  const progress = Math.min((typedText.length / CALIBRATION_PARAGRAPH.length) * 100, 100);
  const isComplete = typedText.length >= CALIBRATION_PARAGRAPH.length * 0.9;

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-primary mb-4 animate-pulse-glow">
            <Fingerprint className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-mono text-foreground">BIOMETRIC CALIBRATION</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            {currentUser?.masterProfile ? 'Verify your identity' : 'Establish your keystroke baseline'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-lg p-6 glow-primary">
          {/* Target paragraph */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Keyboard className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Type the following text
              </span>
            </div>
            <p className="text-sm font-mono text-secondary-foreground bg-secondary p-4 rounded-md leading-relaxed select-none">
              {CALIBRATION_PARAGRAPH}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-1 text-right">
              {progress.toFixed(0)}% complete
            </p>
          </div>

          {/* Textarea */}
          <textarea
            value={typedText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            disabled={status !== 'typing'}
            placeholder="Start typing here..."
            className="w-full h-32 bg-secondary border border-border rounded-md p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />

          {/* Status messages */}
          {status === 'analyzing' && (
            <div className="mt-4 flex items-center gap-2 text-primary font-mono text-sm">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Analyzing keystroke patterns...
            </div>
          )}
          {status === 'success' && (
            <div className="mt-4 flex items-center gap-2 text-success font-mono text-sm">
              <CheckCircle className="w-4 h-4" /> {message}
            </div>
          )}
          {status === 'fail' && (
            <div className="mt-4 flex items-center gap-2 text-destructive font-mono text-sm">
              <XCircle className="w-4 h-4" /> {message}
            </div>
          )}

          {/* Submit */}
          {status === 'typing' && (
            <Button
              onClick={analyzeProfile}
              disabled={!isComplete}
              className="w-full mt-4 font-mono uppercase tracking-wider"
            >
              Analyze Keystroke Pattern
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalibrationPage;
