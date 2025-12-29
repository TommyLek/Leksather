// Beräkna påskdagen med Gauß algoritm
function getEasterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// Lägg till/ta bort dagar från ett datum
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Beräkna midsommardagen (lördag mellan 20-26 juni)
function getMidsummerDay(year) {
  const june20 = new Date(year, 5, 20);
  const dayOfWeek = june20.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  return addDays(june20, daysUntilSaturday);
}

// Beräkna alla helgons dag (lördag mellan 31 okt - 6 nov)
function getAllSaintsDay(year) {
  const oct31 = new Date(year, 9, 31);
  const dayOfWeek = oct31.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  return addDays(oct31, daysUntilSaturday);
}

// Formatera datum till YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Hämta alla svenska helgdagar för ett år
export function getSwedishHolidays(year) {
  const easter = getEasterSunday(year);
  const midsummer = getMidsummerDay(year);
  const allSaints = getAllSaintsDay(year);

  const holidays = [
    { date: `${year}-01-01`, name: 'Nyårsdagen' },
    { date: `${year}-01-06`, name: 'Trettondedag jul' },
    { date: formatDate(addDays(easter, -2)), name: 'Långfredagen' },
    { date: formatDate(easter), name: 'Påskdagen' },
    { date: formatDate(addDays(easter, 1)), name: 'Annandag påsk' },
    { date: `${year}-05-01`, name: 'Första maj' },
    { date: formatDate(addDays(easter, 39)), name: 'Kristi himmelsfärdsdag' },
    { date: formatDate(addDays(easter, 49)), name: 'Pingstdagen' },
    { date: `${year}-06-06`, name: 'Nationaldagen' },
    { date: formatDate(addDays(midsummer, -1)), name: 'Midsommarafton' },
    { date: formatDate(midsummer), name: 'Midsommardagen' },
    { date: formatDate(allSaints), name: 'Alla helgons dag' },
    { date: `${year}-12-24`, name: 'Julafton' },
    { date: `${year}-12-25`, name: 'Juldagen' },
    { date: `${year}-12-26`, name: 'Annandag jul' },
    { date: `${year}-12-31`, name: 'Nyårsafton' },
  ];

  return holidays;
}

// Hämta helgdag för ett specifikt datum
export function getHolidayForDate(dateStr, year) {
  const holidays = getSwedishHolidays(year);
  return holidays.find(h => h.date === dateStr);
}
