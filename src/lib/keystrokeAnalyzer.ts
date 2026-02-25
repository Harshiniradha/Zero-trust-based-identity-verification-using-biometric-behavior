import { KeystrokeProfile } from '@/data/mockData';

export interface KeyEvent {
  key: string;
  type: 'down' | 'up';
  timestamp: number;
}

export interface MouseEvent2 {
  x: number;
  y: number;
  timestamp: number;
}

const DEVIATION_THRESHOLD = 0.30;

export function captureKeystrokeProfile(events: KeyEvent[], mouseEvents?: MouseEvent2[], durationMs?: number): KeystrokeProfile {
  const dwellTimes: number[] = [];
  const flightTimes: number[] = [];

  const keyDownMap = new Map<string, number>();
  let lastKeyUpTime: number | null = null;
  let charCount = 0;

  for (const event of events) {
    if (event.type === 'down') {
      keyDownMap.set(event.key, event.timestamp);
    } else if (event.type === 'up') {
      const downTime = keyDownMap.get(event.key);
      if (downTime !== undefined) {
        dwellTimes.push(event.timestamp - downTime);
        keyDownMap.delete(event.key);
        if (event.key.length === 1) charCount++;
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

  // Calculate WPM: words = chars / 5, time in minutes
  const totalTimeMs = durationMs || (events.length > 1 ? events[events.length - 1].timestamp - events[0].timestamp : 0);
  const totalTimeMin = totalTimeMs / 60000;
  const typingSpeedWPM = totalTimeMin > 0 ? Math.round((charCount / 5) / totalTimeMin) : 0;

  // Calculate mouse speed and pattern
  let mouseSpeed = 0;
  let mousePattern: 'linear' | 'erratic' | 'smooth' | 'unknown' = 'unknown';

  if (mouseEvents && mouseEvents.length > 1) {
    const speeds: number[] = [];
    const angles: number[] = [];
    for (let i = 1; i < mouseEvents.length; i++) {
      const dx = mouseEvents[i].x - mouseEvents[i - 1].x;
      const dy = mouseEvents[i].y - mouseEvents[i - 1].y;
      const dt = mouseEvents[i].timestamp - mouseEvents[i - 1].timestamp;
      if (dt > 0) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        speeds.push(dist / dt * 1000); // pixels per second
        angles.push(Math.atan2(dy, dx));
      }
    }
    mouseSpeed = speeds.length > 0 ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0;

    // Determine pattern based on angle variance
    if (angles.length > 2) {
      const angleDiffs: number[] = [];
      for (let i = 1; i < angles.length; i++) {
        angleDiffs.push(Math.abs(angles[i] - angles[i - 1]));
      }
      const avgAngleDiff = angleDiffs.reduce((a, b) => a + b, 0) / angleDiffs.length;
      if (avgAngleDiff < 0.3) mousePattern = 'linear';
      else if (avgAngleDiff < 0.8) mousePattern = 'smooth';
      else mousePattern = 'erratic';
    }
  }

  return { avgDwellTime, avgFlightTime, dwellTimes, flightTimes, typingSpeedWPM, mouseSpeed, mousePattern };
}

export function compareProfiles(master: KeystrokeProfile, current: KeystrokeProfile): {
  match: boolean;
  dwellDeviation: number;
  flightDeviation: number;
  typingSpeedDeviation: number;
  mouseSpeedDeviation: number;
  overallDeviation: number;
} {
  const dwellDeviation = master.avgDwellTime > 0
    ? Math.abs(current.avgDwellTime - master.avgDwellTime) / master.avgDwellTime
    : 0;
  const flightDeviation = master.avgFlightTime > 0
    ? Math.abs(current.avgFlightTime - master.avgFlightTime) / master.avgFlightTime
    : 0;
  const typingSpeedDeviation = master.typingSpeedWPM > 0
    ? Math.abs(current.typingSpeedWPM - master.typingSpeedWPM) / master.typingSpeedWPM
    : 0;
  const mouseSpeedDeviation = master.mouseSpeed > 0 && current.mouseSpeed > 0
    ? Math.abs(current.mouseSpeed - master.mouseSpeed) / master.mouseSpeed
    : 0;

  // Weighted average: keystroke 40%, flight 25%, typing speed 20%, mouse 15%
  const overallDeviation = 
    dwellDeviation * 0.4 + 
    flightDeviation * 0.25 + 
    typingSpeedDeviation * 0.20 + 
    mouseSpeedDeviation * 0.15;

  const match = overallDeviation <= DEVIATION_THRESHOLD;

  return { match, dwellDeviation, flightDeviation, typingSpeedDeviation, mouseSpeedDeviation, overallDeviation };
}

export function calculateRiskIncrease(deviation: number): number {
  if (deviation <= DEVIATION_THRESHOLD) return 0;
  const excess = deviation - DEVIATION_THRESHOLD;
  return Math.min(excess * 100, 15);
}
