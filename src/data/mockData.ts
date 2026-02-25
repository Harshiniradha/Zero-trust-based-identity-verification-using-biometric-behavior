export interface KeystrokeProfile {
  avgDwellTime: number; // ms key held down
  avgFlightTime: number; // ms between key release and next key press
  dwellTimes: number[];
  flightTimes: number[];
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
  sessionDuration: number; // seconds
}

export interface ExamQuestion {
  id: number;
  question: string;
  correctAnswer: string;
}

export const CALIBRATION_PARAGRAPH = "The quick brown fox jumps over the lazy dog. Security is not a product but a process. Every keystroke tells a unique story about who you are.";

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
    question: "What is the primary purpose of a firewall in network security?",
    correctAnswer: "filter incoming and outgoing network traffic",
  },
  {
    id: 2,
    question: "Which encryption algorithm is considered the most secure for symmetric encryption?",
    correctAnswer: "AES-256",
  },
  {
    id: 3,
    question: "What does 'Zero Trust' mean in cybersecurity?",
    correctAnswer: "never trust always verify every request",
  },
  {
    id: 4,
    question: "Which protocol provides secure communication over the internet?",
    correctAnswer: "HTTPS TLS",
  },
  {
    id: 5,
    question: "What is a SQL injection attack?",
    correctAnswer: "injecting malicious SQL code through input fields",
  },
  {
    id: 6,
    question: "What is two-factor authentication (2FA)?",
    correctAnswer: "combining two different verification methods",
  },
  {
    id: 7,
    question: "What does a VPN primarily provide?",
    correctAnswer: "encrypted tunnel for data transmission",
  },
  {
    id: 8,
    question: "Which hash function is commonly used for password storage?",
    correctAnswer: "bcrypt",
  },
  {
    id: 9,
    question: "What is phishing?",
    correctAnswer: "social engineering attack using deceptive messages",
  },
  {
    id: 10,
    question: "What is the purpose of an Intrusion Detection System (IDS)?",
    correctAnswer: "monitor and alert on suspicious network activity",
  },
];
