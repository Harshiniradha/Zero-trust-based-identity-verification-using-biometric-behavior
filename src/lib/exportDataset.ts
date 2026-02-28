import { User } from '@/data/mockData';

function escapeCsvValue(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportUsersToExcel(users: User[]) {
  const data = users
    .filter(u => u.masterProfile)
    .map(u => ({
      User_ID: u.id,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Typing_Speed_WPM: u.masterProfile!.typingSpeedWPM,
      Avg_Dwell_Time: Math.round(u.masterProfile!.avgDwellTime * 100) / 100,
      Avg_Flight_Time: Math.round(u.masterProfile!.avgFlightTime * 100) / 100,
      Mouse_Speed: u.masterProfile!.mouseSpeed,
      Mouse_Pattern: u.masterProfile!.mousePattern,
      Dwell_Times: u.masterProfile!.dwellTimes.join('; '),
      Flight_Times: u.masterProfile!.flightTimes.join('; '),
    }));

  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.map(escapeCsvValue).join(','),
    ...data.map(row =>
      headers.map(h => escapeCsvValue((row as Record<string, string | number>)[h])).join(',')
    ),
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'biometric_dataset.csv';
  link.click();
  URL.revokeObjectURL(url);
}
