/**
 * "YYYYMMDD" 형식 문자열을 Date 객체로 변환
 * @param dateStr YYYYMMDD 형식의 날짜 문자열
 * @returns Date 객체
 */
export function parseYYYYMMDD(dateStr: string): Date {
  if (!dateStr || dateStr.trim().length !== 8) {
    return new Date(""); // Invalid Date
  }

  const year = Number(dateStr.slice(0, 4));
  const month = Number(dateStr.slice(4, 6)) - 1; // JS 월은 0부터 시작
  const day = Number(dateStr.slice(6, 8));

  return new Date(year, month, day);
}
