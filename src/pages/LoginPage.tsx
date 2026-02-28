import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '@/context/ExamContext';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useExam();
  const navigate = useNavigate();

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
    } else if (!user.calibrated) {
      navigate('/calibration');
    } else {
      navigate('/exam');
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
    </div>
  );
};

export default LoginPage;
