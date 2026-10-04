export const getPeriodName = (index: number, totalPeriods: number = 2) => {
  const safeIndex = Math.max(0, index || 0);
  const safeTotal = Math.max(1, totalPeriods || 2);
  if (safeTotal === 2) {
    return safeIndex === 0 ? '1ère Mi-temps' : '2ème Mi-temps';
  } else if (safeTotal === 3) {
    return `${safeIndex + 1}${safeIndex === 0 ? 'er' : 'ème'} Tiers`;
  } else if (safeTotal === 4) {
    return `${safeIndex + 1}${safeIndex === 0 ? 'er' : 'ème'} Quart-temps`;
  } else {
    return `Période ${safeIndex + 1}`;
  }
};

export const getPeriodShortName = (index: number, totalPeriods: number = 2) => {
  const safeIndex = Math.max(0, index || 0);
  const safeTotal = Math.max(1, totalPeriods || 2);
  if (safeTotal === 2) {
    return safeIndex === 0 ? '1MT' : '2MT';
  } else if (safeTotal === 3) {
    return `T${safeIndex + 1}`;
  } else if (safeTotal === 4) {
    return `Q${safeIndex + 1}`;
  } else {
    return `P${safeIndex + 1}`;
  }
};

export const formatTime = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/** Minute façon commentateur : 22:30 → « 23' », temps additionnel → « 90+2' ». */
export const formatEventMinute = (second: number, periodIndex: number, periodDurationMin: number) => {
  const periodEndMin = (periodIndex + 1) * Math.max(1, periodDurationMin);
  const periodEndSec = periodEndMin * 60;
  if (second >= periodEndSec) {
    return `${periodEndMin}+${Math.floor((second - periodEndSec) / 60) + 1}'`;
  }
  return `${Math.floor(second / 60) + 1}'`;
};

export const teamLabel = (name: string, fallback: string) => name.trim() || fallback;
