import * as XLSX from 'xlsx';
import { User } from '@/data/mockData';

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
      Dwell_Times: u.masterProfile!.dwellTimes.join(', '),
      Flight_Times: u.masterProfile!.flightTimes.join(', '),
    }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Biometric Dataset');
  
  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map(key => ({ wch: Math.max(key.length + 2, 15) }));
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, 'biometric_dataset.xlsx');
}
