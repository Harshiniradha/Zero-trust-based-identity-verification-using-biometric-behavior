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
  options: string[];
  correctAnswer: number;
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
    options: [
      "To speed up internet connection",
      "To filter incoming and outgoing network traffic",
      "To store encrypted passwords",
      "To compress data packets"
    ],
    correctAnswer: 1,
  },
  {
    id: 2,
    question: "Which encryption algorithm is considered the most secure for symmetric encryption?",
    options: ["DES", "AES-256", "ROT13", "Base64"],
    correctAnswer: 1,
  },
  {
    id: 3,
    question: "What does 'Zero Trust' mean in cybersecurity?",
    options: [
      "Trust no external networks",
      "Never verify user identity",
      "Never trust, always verify every request",
      "Only trust administrators"
    ],
    correctAnswer: 2,
  },
  {
    id: 4,
    question: "Which protocol provides secure communication over the internet?",
    options: ["HTTP", "FTP", "HTTPS/TLS", "SMTP"],
    correctAnswer: 2,
  },
  {
    id: 5,
    question: "What is a SQL injection attack?",
    options: [
      "A hardware-based attack",
      "Injecting malicious SQL code through input fields",
      "A type of DDoS attack",
      "Encrypting database records"
    ],
    correctAnswer: 1,
  },
  {
    id: 6,
    question: "What is two-factor authentication (2FA)?",
    options: [
      "Using two passwords",
      "Logging in from two devices",
      "Combining two different verification methods",
      "Having two admin accounts"
    ],
    correctAnswer: 2,
  },
  {
    id: 7,
    question: "What does a VPN primarily provide?",
    options: [
      "Faster internet speed",
      "Encrypted tunnel for data transmission",
      "Free internet access",
      "Virus protection"
    ],
    correctAnswer: 1,
  },
  {
    id: 8,
    question: "Which hash function is commonly used for password storage?",
    options: ["MD5", "SHA-1", "bcrypt", "CRC32"],
    correctAnswer: 2,
  },
  {
    id: 9,
    question: "What is phishing?",
    options: [
      "A network scanning technique",
      "A social engineering attack using deceptive messages",
      "A type of malware",
      "A firewall bypass method"
    ],
    correctAnswer: 1,
  },
  {
    id: 10,
    question: "What is the purpose of an Intrusion Detection System (IDS)?",
    options: [
      "To prevent all cyber attacks",
      "To encrypt sensitive data",
      "To monitor and alert on suspicious network activity",
      "To manage user passwords"
    ],
    correctAnswer: 2,
  },
];
