import { useExam } from '@/context/ExamContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, AlertTriangle, Activity, LogOut, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AdminDashboard = () => {
  const { currentUser, activeSessions, violationLogs, users, logout } = useExam();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser || currentUser.role !== 'admin') {
    navigate('/');
    return null;
  }

  const students = users.filter(u => u.role === 'student');
  const activeCount = activeSessions.filter(s => s.status === 'active').length;
  const terminatedCount = activeSessions.filter(s => s.status === 'terminated').length;

  // Build chart data from a session with history
  const sessionWithData = activeSessions.find(s => s.keystrokeHistory.length > 0);
  const chartData = sessionWithData?.keystrokeHistory.map((entry, i) => ({
    sample: i + 1,
    deviation: +(entry.deviation * 100).toFixed(1),
    threshold: 30,
  })) || [
    { sample: 1, deviation: 5, threshold: 30 },
    { sample: 2, deviation: 8, threshold: 30 },
    { sample: 3, deviation: 12, threshold: 30 },
    { sample: 4, deviation: 15, threshold: 30 },
    { sample: 5, deviation: 22, threshold: 30 },
    { sample: 6, deviation: 18, threshold: 30 },
    { sample: 7, deviation: 35, threshold: 30 },
    { sample: 8, deviation: 42, threshold: 30 },
  ];

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <h1 className="font-mono font-bold text-foreground text-lg">ADMIN CONSOLE</h1>
              <p className="text-xs font-mono text-muted-foreground">Faculty Analytics Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-muted-foreground">{currentUser.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="font-mono text-xs">
              <LogOut className="w-3 h-3 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: students.length, icon: Users, color: 'text-primary' },
            { label: 'Active Sessions', value: activeCount, icon: Activity, color: 'text-success' },
            { label: 'Terminated', value: terminatedCount, icon: UserX, color: 'text-destructive' },
            { label: 'Violations Logged', value: violationLogs.length, icon: AlertTriangle, color: 'text-warning' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Session Health */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Real-Time Session Health
          </h2>
          {activeSessions.length === 0 ? (
            <p className="text-sm font-mono text-muted-foreground">No active sessions.</p>
          ) : (
            <div className="space-y-3">
              {activeSessions.map(session => (
                <div key={session.userId} className="flex items-center justify-between p-4 bg-secondary rounded-md border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${session.status === 'active' ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
                    <div>
                      <p className="font-mono text-sm text-foreground font-medium">{session.userName}</p>
                      <p className="font-mono text-xs text-muted-foreground">{session.userId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-mono text-muted-foreground">Risk Score</p>
                      <p className={`font-mono font-bold text-sm ${
                        session.riskScore < 50 ? 'text-success' : session.riskScore < 80 ? 'text-warning' : 'text-destructive'
                      }`}>
                        {session.riskScore.toFixed(0)}%
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-mono ${
                      session.status === 'active' 
                        ? 'bg-success/10 text-success border border-success/30' 
                        : 'bg-destructive/10 text-destructive border border-destructive/30'
                    }`}>
                      {session.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-mono font-semibold text-foreground mb-4">
            Typing Consistency — Baseline vs Current
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
                <XAxis dataKey="sample" stroke="hsl(215 15% 50%)" tick={{ fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                <YAxis stroke="hsl(215 15% 50%)" tick={{ fontFamily: 'JetBrains Mono', fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(220 18% 10%)',
                    border: '1px solid hsl(220 15% 18%)',
                    borderRadius: '8px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px',
                    color: 'hsl(200 20% 90%)',
                  }}
                />
                <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }} />
                <Line type="monotone" dataKey="deviation" stroke="hsl(170 80% 50%)" strokeWidth={2} name="Current Deviation" dot={{ fill: 'hsl(170 80% 50%)' }} />
                <Line type="monotone" dataKey="threshold" stroke="hsl(0 85% 55%)" strokeWidth={2} strokeDasharray="5 5" name="Threshold (30%)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Violation Logs */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" /> Terminated Users — Violation Logs
          </h2>
          {violationLogs.length === 0 ? (
            <p className="text-sm font-mono text-muted-foreground">No violations recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-3 px-2">User</th>
                    <th className="text-left py-3 px-2">Reason</th>
                    <th className="text-left py-3 px-2">Risk Score</th>
                    <th className="text-left py-3 px-2">Duration</th>
                    <th className="text-left py-3 px-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {violationLogs.map(log => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/50">
                      <td className="py-3 px-2 text-foreground">{log.userName}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-1 rounded bg-destructive/10 text-destructive border border-destructive/30 text-xs">
                          {log.reason}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-destructive font-bold">{log.riskScoreAtTermination.toFixed(0)}%</td>
                      <td className="py-3 px-2 text-muted-foreground">{log.sessionDuration}s</td>
                      <td className="py-3 px-2 text-muted-foreground text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
