export interface KeystrokeProfile {
  avgDwellTime: number;
  avgFlightTime: number;
  dwellTimes: number[];
  flightTimes: number[];
  typingSpeedWPM: number;
  mouseSpeed: number;
  mousePattern: 'linear' | 'erratic' | 'smooth' | 'unknown';
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
  masterProfile: KeystrokeProfile | null;
  calibrated: boolean;
}

export interface ViolationLog {
  id: string;
  userId: string;
  userName: string;
  reason: string;
  timestamp: string;
  riskScoreAtTermination: number;
  sessionDuration: number;
}

export interface ExamQuestion {
  id: number;
  question: string;
  correctAnswer: string;
}

export const CALIBRATION_PARAGRAPH = "The quick brown fox jumps over the lazy dog. Security is not a product but a process. Every keystroke tells a unique story about who you are. Biometric authentication ensures that only the rightful user can access the system.";

export const initialUsers: User[] = [
  {
    id: 'STU001',
    name: 'Alex Morgan',
    email: 'alex@university.edu',
    password: 'exam2024',
    role: 'student',
    masterProfile: {
      avgDwellTime: 95,
      avgFlightTime: 130,
      dwellTimes: [90, 100, 88, 95, 102, 91, 98, 93, 97, 94],
      flightTimes: [125, 135, 128, 132, 127, 134, 130, 126, 133, 129],
      typingSpeedWPM: 62,
      mouseSpeed: 450,
      mousePattern: 'smooth',
    },
    calibrated: true,
  },
  {
    id: 'STU002',
    name: 'Jordan Lee',
    email: 'jordan@university.edu',
    password: 'exam2024',
    role: 'student',
    masterProfile: {
      avgDwellTime: 110,
      avgFlightTime: 145,
      dwellTimes: [105, 115, 108, 112, 107, 114, 110, 106, 113, 109],
      flightTimes: [140, 150, 142, 148, 141, 149, 145, 143, 147, 144],
      typingSpeedWPM: 48,
      mouseSpeed: 380,
      mousePattern: 'linear',
    },
    calibrated: true,
  },
  {
    id: 'STU003',
    name: 'Sam Rivera',
    email: 'sam@university.edu',
    password: 'exam2024',
    role: 'student',
    masterProfile: null,
    calibrated: false,
  },
  {
    id: 'ADM001',
    name: 'Dr. Harper',
    email: 'admin@university.edu',
    password: 'admin2024',
    role: 'admin',
    masterProfile: null,
    calibrated: true,
  },
];

export const examQuestions: ExamQuestion[] = [
  {
    id: 1,
    question: "Explain the primary purpose of a firewall in network security and how it protects organizational infrastructure.",
    correctAnswer: "filter incoming and outgoing network traffic",
  },
  {
    id: 2,
    question: "Describe why AES-256 is considered the most secure symmetric encryption algorithm and its key advantages.",
    correctAnswer: "AES-256",
  },
  {
    id: 3,
    question: "Explain the concept of 'Zero Trust' in cybersecurity and why modern organizations adopt this approach.",
    correctAnswer: "never trust always verify every request",
  },
  {
    id: 4,
    question: "Describe how HTTPS and TLS protocols work together to provide secure communication over the internet.",
    correctAnswer: "HTTPS TLS",
  },
  {
    id: 5,
    question: "Explain what a SQL injection attack is, how it works, and what measures can prevent it.",
    correctAnswer: "injecting malicious SQL code through input fields",
  },
  {
    id: 6,
    question: "Describe two-factor authentication (2FA), its importance, and provide examples of different verification methods.",
    correctAnswer: "combining two different verification methods",
  },
  {
    id: 7,
    question: "Explain what a VPN provides, how it creates secure connections, and common use cases in enterprise environments.",
    correctAnswer: "encrypted tunnel for data transmission",
  },
  {
    id: 8,
    question: "Discuss why bcrypt is commonly used for password storage and how it differs from simple hashing algorithms.",
    correctAnswer: "bcrypt",
  },
  {
    id: 9,
    question: "Describe phishing attacks, the social engineering techniques used, and how organizations can defend against them.",
    correctAnswer: "social engineering attack using deceptive messages",
  },
  {
    id: 10,
    question: "Explain the purpose and functioning of an Intrusion Detection System (IDS) in network security monitoring.",
    correctAnswer: "monitor and alert on suspicious network activity",
  },
];
