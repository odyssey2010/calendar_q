// 국가별 휴일 정보 fetch 함수 (Nager.Date API 사용)
// https://date.nager.at/Api
export async function fetchHolidays(year: number, countryCode: string): Promise<{ date: string, localName: string }[]> {
  let url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
  let isAE = false;
  if (countryCode === 'AE') {
    url = `https://tallyfy.com/national-holidays/api/AE/${year}.json`;
    isAE = true;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('휴일 fetch 실패:', res.status, res.statusText);
      return [];
    }
    const text = await res.text();
    if (!text) {
      console.warn('휴일 fetch: 응답이 비어있음');
      return [];
    }
    const data = JSON.parse(text);
    if (isAE) {
      // tallyfy.com 응답 파싱: { holidays: [ { date: '2026-12-02', name: 'UAE National Day' }, ... ] }
      if (data && Array.isArray(data.holidays)) {
        return data.holidays.map((item: any) => ({ date: item.date, localName: item.name }));
      }
      return [];
    }
    return Array.isArray(data) ? data.map((item: any) => ({ date: item.date, localName: item.localName })) : [];
  } catch (err) {
    console.error('fetchHolidays 에러:', err);
    return [];
  }
}
