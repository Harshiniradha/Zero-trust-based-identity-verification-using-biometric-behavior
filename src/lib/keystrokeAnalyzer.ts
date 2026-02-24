import { KeystrokeProfile } from '@/data/mockData';

export interface KeyEvent {
  key: string;
  type: 'down' | 'up';
  timestamp: number;
}

const DEVIATION_THRESHOLD = 0.30; // 30%

export function captureKeystrokeProfile(events: KeyEvent[]): KeystrokeProfile {
  const dwellTimes: number[] = [];
  const flightTimes: number[] = [];

  const keyDownMap = new Map<string, number>();
  let lastKeyUpTime: number | null = null;

  for (const event of events) {
    if (event.type === 'down') {
      keyDownMap.set(event.key, event.timestamp);
    } else if (event.type === 'up') {
      const downTime = keyDownMap.get(event.key);
      if (downTime !== undefined) {
        dwellTimes.push(event.timestamp - downTime);
        keyDownMap.delete(event.key);
      }
      if (lastKeyUpTime !== null) {
        const flight = event.timestamp - lastKeyUpTime;
        if (flight > 0 && flight < 1000) {
          flightTimes.push(flight);
        }
      }
      lastKeyUpTime = event.timestamp;
    }
  }

  const avgDwellTime = dwellTimes.length > 0 
    ? dwellTimes.reduce((a, b) => a + b, 0) / dwellTimes.length 
    : 0;
  const avgFlightTime = flightTimes.length > 0 
    ? flightTimes.reduce((a, b) => a + b, 0) / flightTimes.length 
    : 0;

  return { avgDwellTime, avgFlightTime, dwellTimes, flightTimes };
}

export function compareProfiles(master: KeystrokeProfile, current: KeystrokeProfile): {
  match: boolean;
  dwellDeviation: number;
  flightDeviation: number;
  overallDeviation: number;
} {
  const dwellDeviation = master.avgDwellTime > 0
    ? Math.abs(current.avgDwellTime - master.avgDwellTime) / master.avgDwellTime
    : 0;
  const flightDeviation = master.avgFlightTime > 0
    ? Math.abs(current.avgFlightTime - master.avgFlightTime) / master.avgFlightTime
    : 0;

  const overallDeviation = (dwellDeviation + flightDeviation) / 2;
  const match = overallDeviation <= DEVIATION_THRESHOLD;

  return { match, dwellDeviation, flightDeviation, overallDeviation };
}

export function calculateRiskIncrease(deviation: number): number {
  if (deviation <= DEVIATION_THRESHOLD) return 0;
  // Scale risk increase based on how far beyond threshold
  const excess = deviation - DEVIATION_THRESHOLD;
  return Math.min(excess * 100, 15); // max 15% increase per check
}
