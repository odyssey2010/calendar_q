import React, { useState, useEffect } from 'react';
import { fetchRates } from '../utils/fetchRates';

const countries = [
  { code: 'UAE', currency: 'AED', name: '아랍에미리트' },
  { code: 'KOR', currency: 'KRW', name: '대한민국' },
  { code: 'USA', currency: 'USD', name: '미국' },
  { code: 'JPN', currency: 'JPY', name: '일본' },
  // 필요시 추가
];

function CurrencyView() {
  const [input1, setInput1] = useState<string>('');
  const [input2, setInput2] = useState<string>('');
  const [input3, setInput3] = useState<string>('');
  const [country1, setCountry1] = useState('UAE');
  const [country2, setCountry2] = useState('KOR');
  const [country3, setCountry3] = useState('USA');
  const [rates, setRates] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 환율 fetch
  useEffect(() => {
    setLoading(true);
    setError('');
    fetchRates('AED', ['KRW', 'USD'])
      .then(r => {
        setRates({
          AED_KRW: r.KRW,
          AED_USD: r.USD,
          KRW_AED: 1 / r.KRW,
          KRW_USD: r.USD / r.KRW,
          USD_AED: 1 / r.USD,
          USD_KRW: r.KRW / r.USD,
        });
        setLoading(false);
      })
      .catch(e => {
        setError('환율 정보를 가져오지 못했습니다' + (e instanceof Error ? e.message : '')  );
        setLoading(false);
      });
  }, []);

  // 환율 변환
  const handleInput1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '');
    setInput1(e.target.value);
    const value = parseFloat(raw);
    if (isNaN(value) || value === 0) {
      setInput2('');
      setInput3('');
      return;
    }
    if (rates.AED_KRW) setInput2((value * rates.AED_KRW).toLocaleString());
    if (rates.AED_USD) setInput3((value * rates.AED_USD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const handleInput2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '');
    setInput2(e.target.value);
    const value = parseFloat(raw);
    if (isNaN(value) || value === 0) {
      setInput1('');
      setInput3('');
      return;
    }
    if (rates.KRW_AED) setInput1((value * rates.KRW_AED).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    if (rates.KRW_USD) setInput3((value * rates.KRW_USD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const handleInput3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '');
    setInput3(e.target.value);
    const value = parseFloat(raw);
    if (isNaN(value) || value === 0) {
      setInput1('');
      setInput2('');
      return;
    }
    if (rates.USD_AED) setInput1((value * rates.USD_AED).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    if (rates.USD_KRW) setInput2((value * rates.USD_KRW).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  // 국가 선택 변경 시 환율 적용
  const handleCountry1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry1(e.target.value);
    // 환율 적용 로직 필요
  };
  const handleCountry2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry2(e.target.value);
    // 환율 적용 로직 필요
  };
  const handleCountry3Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry3(e.target.value);
    // 환율 적용 로직 필요
  };

  return (
    <div style={{ padding: '8px' }}>
      <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>환율 변환</h3>
      {loading ? (
        <div style={{ textAlign: 'center', color: '#888' }}>환율 정보를 불러오는 중...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', color: 'red', fontSize: '0.9rem' }}>{error}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <input
              type="text"
              value={input1}
              onChange={handleInput1Change}
              style={{ width: 'calc(80% - 2px)', fontSize: '16px', padding: '8px', boxSizing: 'border-box' }}
              placeholder="금액"
              inputMode="decimal"
            />
            <select value={country1} onChange={handleCountry1Change} style={{ width: 'calc(50% - 2px)', fontSize: '14px', padding: '8px', boxSizing: 'border-box' }}>
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.currency}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <input
              type="text"
              value={input2}
              onChange={handleInput2Change}
              style={{ width: 'calc(80% - 2px)', fontSize: '16px', padding: '8px', boxSizing: 'border-box' }}
              placeholder="금액"
              inputMode="decimal"
            />
            <select value={country2} onChange={handleCountry2Change} style={{ width: 'calc(50% - 2px)', fontSize: '14px', padding: '8px', boxSizing: 'border-box' }}>
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.currency}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <input
              type="text"
              value={input3}
              onChange={handleInput3Change}
              style={{ width: 'calc(80% - 2px)', fontSize: '16px', padding: '8px', boxSizing: 'border-box' }}
              placeholder="금액"
              inputMode="decimal"
            />
            <select value={country3} onChange={handleCountry3Change} style={{ width: 'calc(50% - 2px)', fontSize: '14px', padding: '8px', boxSizing: 'border-box' }}>
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.currency}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      {/* 환율 정보 안내 문구 제거됨 */}
    </div>
  );
}

export default CurrencyView;
