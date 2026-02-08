// Fawaz Ahmed's Exchange Rate API 사용
// base: 기준 통화, symbols: 변환 대상 통화 배열
// 예시: base=usd, symbols=[aed, krw]
export async function fetchRates(base: string, symbols: string[]): Promise<Record<string, number>> {
  const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base.toLowerCase()}.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('환율 fetch 실패:', res.status, res.statusText);
      throw new Error('환율 정보를 가져오지 못했습니다');
    }
    const data = await res.json();
    // Fawaz Ahmed API는 { base: { ...통화: 값 } } 구조
    const baseKey = base.toLowerCase();
    const baseObj = data[baseKey];
    const rates: Record<string, number> = {};
    symbols.forEach(sym => {
      const key = sym.toLowerCase();
      if (baseObj && baseObj[key]) {
        rates[sym.toUpperCase()] = baseObj[key];
      }
    });
    return rates;
  } catch (err) {
    console.error('fetchRates 에러:', err);
    throw err;
  }
}
