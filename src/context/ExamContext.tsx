import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, ViolationLog, initialUsers, KeystrokeProfile } from '@/data/mockData';

interface ActiveSession {
  userId: string;
  userName: string;
  riskScore: number;
  startTime: string;
  status: 'active' | 'terminated';
  keystrokeHistory: { timestamp: string; deviation: number }[];
}

interface ExamContextType {
  users: User[];
  currentUser: User | null;
  violationLogs: ViolationLog[];
  activeSessions: ActiveSession[];
  webcamApproved: boolean;
  login: (email: string, password: string) => User | null;
  logout: () => void;
  setWebcamApproved: (approved: boolean) => void;
  updateUserProfile: (userId: string, profile: KeystrokeProfile) => void;
  markCalibrated: (userId: string) => void;
  addViolationLog: (log: Omit<ViolationLog, 'id'>) => void;
  startSession: (userId: string, userName: string) => void;
  updateSessionRisk: (userId: string, riskScore: number, deviation: number) => void;
  terminateSession: (userId: string) => void;
}

const ExamContext = createContext<ExamContextType | null>(null);

export function ExamProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [violationLogs, setViolationLogs] = useState<ViolationLog[]>([
    {
      id: 'VIO-SAMPLE-1',
      userId: 'STU-002',
      userName: 'Ravi Kumar',
      reason: 'Keystroke pattern deviation exceeded threshold (87%)',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      riskScoreAtTermination: 87,
      sessionDuration: 1240,
    },
    {
      id: 'VIO-SAMPLE-2',
      userId: 'STU-003',
      userName: 'Priya Sharma',
      reason: 'Multiple face anomalies detected',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      riskScoreAtTermination: 92,
      sessionDuration: 680,
    },
    {
      id: 'VIO-SAMPLE-3',
      userId: 'STU-005',
      userName: 'Arun Patel',
      reason: 'Tab switch detected during exam',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      riskScoreAtTermination: 75,
      sessionDuration: 420,
    },
  ]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [webcamApproved, setWebcamApproved] = useState(false);

  const login = useCallback((email: string, password: string): User | null => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) setCurrentUser(user);
    return user || null;
  }, [users]);

  const logout = useCallback(() => setCurrentUser(null), []);

  const updateUserProfile = useCallback((userId: string, profile: KeystrokeProfile) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, masterProfile: profile } : u));
  }, []);

  const markCalibrated = useCallback((userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, calibrated: true } : u));
  }, []);

  const addViolationLog = useCallback((log: Omit<ViolationLog, 'id'>) => {
    setViolationLogs(prev => [...prev, { ...log, id: `VIO-${Date.now()}` }]);
  }, []);

  const startSession = useCallback((userId: string, userName: string) => {
    setActiveSessions(prev => {
      const filtered = prev.filter(s => s.userId !== userId);
      return [...filtered, {
        userId, userName, riskScore: 0,
        startTime: new Date().toISOString(),
        status: 'active',
        keystrokeHistory: [],
      }];
    });
  }, []);

  const updateSessionRisk = useCallback((userId: string, riskScore: number, deviation: number) => {
    setActiveSessions(prev => prev.map(s =>
      s.userId === userId
        ? {
            ...s,
            riskScore: Math.min(riskScore, 100),
            keystrokeHistory: [
              ...s.keystrokeHistory,
              { timestamp: new Date().toISOString(), deviation },
            ],
          }
        : s
    ));
  }, []);

  const terminateSession = useCallback((userId: string) => {
    setActiveSessions(prev => prev.map(s =>
      s.userId === userId ? { ...s, status: 'terminated' as const } : s
    ));
  }, []);

  return (
    <ExamContext.Provider value={{
      users, currentUser, violationLogs, activeSessions, webcamApproved,
      login, logout, setWebcamApproved, updateUserProfile, markCalibrated,
      addViolationLog, startSession, updateSessionRisk, terminateSession,
    }}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const ctx = useContext(ExamContext);
  if (!ctx) {
    throw new Error('useExam must be used within ExamProvider');
  }
  return ctx;
}
