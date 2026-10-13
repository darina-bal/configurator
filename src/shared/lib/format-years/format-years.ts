/** Число лет с правильным склонением: «1 год», «2 года», «5 лет», «21 год». */
export function formatYears(years: number): string {
  const lastTwo = years % 100;
  const last = years % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${years} лет`;
  if (last === 1) return `${years} год`;
  if (last >= 2 && last <= 4) return `${years} года`;
  return `${years} лет`;
}
