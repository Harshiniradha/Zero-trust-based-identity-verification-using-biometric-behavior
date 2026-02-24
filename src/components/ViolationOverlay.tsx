import { ShieldAlert, XOctagon } from 'lucide-react';

interface ViolationOverlayProps {
  reason: string;
}

const ViolationOverlay = ({ reason }: ViolationOverlayProps) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-destructive flex items-center justify-center animate-danger-pulse">
      <div className="text-center text-destructive-foreground">
        <XOctagon className="w-24 h-24 mx-auto mb-6" />
        <h1 className="text-4xl font-bold font-mono mb-4 tracking-wider">
          SECURITY VIOLATION
        </h1>
        <div className="bg-destructive-foreground/10 border border-destructive-foreground/30 rounded-lg px-8 py-4 mb-6 inline-block">
          <p className="font-mono text-lg">{reason}</p>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5" />
          <p className="font-mono text-sm">Session terminated. Incident logged.</p>
        </div>
        <p className="font-mono text-xs opacity-70">
          Redirecting to login in 5 seconds...
        </p>
      </div>
    </div>
  );
};

export default ViolationOverlay;
