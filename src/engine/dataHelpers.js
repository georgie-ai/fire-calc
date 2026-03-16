import spxData from '../data/spx.json';
import ndxData from '../data/ndx.json';
import cpiData from '../data/cpi.json';
import fedFundsData from '../data/fedFundsRate.json';

// Index data into Maps for O(1) lookup
const spxMap = new Map(spxData.map(d => [d.date, d.return]));
const ndxMap = new Map(ndxData.map(d => [d.date, d.return]));
const cpiMap = new Map(cpiData.map(d => [d.date, d.value]));
const fedFundsMap = new Map(fedFundsData.map(d => [d.date, d.rate]));

// All available month strings sorted
const allSpxDates = spxData.map(d => d.date);
const allNdxDates = ndxData.map(d => d.date);
const allCpiDates = cpiData.map(d => d.date);

export function getMonthlyReturn(vehicle, dateString) {
  if (vehicle === 'spx') {
    return spxMap.get(dateString) ?? 0;
  }
  if (vehicle === 'ndx') {
    return ndxMap.get(dateString) ?? 0;
  }
  if (vehicle === 'cash') {
    const annualRate = fedFundsMap.get(dateString) ?? 0;
    return annualRate / 12;
  }
  return 0;
}

export function getCpiValue(dateString) {
  return cpiMap.get(dateString);
}

export function getTrailing12MonthInflation(dateString) {
  const [year, month] = dateString.split('-').map(Number);
  const prevYear = year - 1;
  const prevDateStr = `${prevYear}-${String(month).padStart(2, '0')}`;
  const currentCpi = cpiMap.get(dateString);
  const prevCpi = cpiMap.get(prevDateStr);
  if (currentCpi == null || prevCpi == null) return 0;
  return (currentCpi / prevCpi) - 1;
}

export function getCumulativeInflation(startDate, endDate) {
  const startCpi = cpiMap.get(startDate);
  const endCpi = cpiMap.get(endDate);
  if (startCpi == null || endCpi == null) return 1;
  return endCpi / startCpi;
}

export function getDateRange(startDate, vehicle) {
  const source = vehicle === 'ndx' ? allNdxDates : allSpxDates;
  const startIdx = source.indexOf(startDate);
  if (startIdx === -1) return [];
  return source.slice(startIdx);
}

export function getAllAvailableDates(vehicle) {
  return vehicle === 'ndx' ? allNdxDates : allSpxDates;
}

export function isJanuary(dateString) {
  return dateString.endsWith('-01');
}

export function dateAddMonths(dateString, months) {
  const [year, month] = dateString.split('-').map(Number);
  const totalMonths = (year * 12 + month - 1) + months;
  const newYear = Math.floor(totalMonths / 12);
  const newMonth = (totalMonths % 12) + 1;
  return `${newYear}-${String(newMonth).padStart(2, '0')}`;
}

export function dateDiffMonths(dateA, dateB) {
  const [yearA, monthA] = dateA.split('-').map(Number);
  const [yearB, monthB] = dateB.split('-').map(Number);
  return (yearB - yearA) * 12 + (monthB - monthA);
}

export function getLastAvailableDate(vehicle) {
  const source = vehicle === 'ndx' ? allNdxDates : allSpxDates;
  return source[source.length - 1];
}

export function getFirstAvailableDate(vehicle) {
  const source = vehicle === 'ndx' ? allNdxDates : allSpxDates;
  return source[0];
}
