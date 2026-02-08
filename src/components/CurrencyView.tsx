import React, { useState, useEffect, useRef } from 'react';
import { fetchRates } from '../utils/fetchRates';

const countries = [
  { code: 'UAE', currency: 'AED', name: '아랍에미리트' },
  { code: 'KOR', currency: 'KRW', name: '대한민국' },
  { code: 'USA', currency: 'USD', name: '미국' },
  { code: 'JPN', currency: 'JPY', name: '일본' },
  // 필요시 추가
];

function CurrencyView() {
  const input1Ref = useRef<HTMLInputElement>(null);
  const [input1, setInput1] = useState<string>('');
  const [input2, setInput2] = useState<string>('');
  const [input3, setInput3] = useState<string>('');
  const [country1, setCountry1] = useState('UAE');
  const [country2, setCountry2] = useState('KOR');
  const [country3, setCountry3] = useState('USA');
  const [rates, setRates] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeInput, setActiveInput] = useState<1 | 2 | 3 | null>(null);

  // 초기 포커스 설정
  useEffect(() => {
    if (input1Ref.current) {
      input1Ref.current.focus();
      setActiveInput(1);
    }
  }, []);

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

  // 키패드 핸들러
  const handleKeypadPress = (key: string) => {
    if (!activeInput) return;

    const currentValue = activeInput === 1 ? input1 : activeInput === 2 ? input2 : input3;
    const setValue = activeInput === 1 ? setInput1 : activeInput === 2 ? setInput2 : setInput3;
    const onChange = activeInput === 1 ? handleInput1Change : activeInput === 2 ? handleInput2Change : handleInput3Change;

    if (key === 'C') {
      setValue('');
      if (activeInput === 1) { setInput2(''); setInput3(''); }
      if (activeInput === 2) { setInput1(''); setInput3(''); }
      if (activeInput === 3) { setInput1(''); setInput2(''); }
    } else if (key === '⌫') {
      const newValue = currentValue.slice(0, -1);
      onChange({ target: { value: newValue } } as React.ChangeEvent<HTMLInputElement>);
    } else if (key === '=') {
      try {
        const raw = currentValue.replace(/,/g, '');
        const result = eval(raw);
        if (!isNaN(result)) {
          onChange({ target: { value: String(result) } } as React.ChangeEvent<HTMLInputElement>);
        }
      } catch (e) {
        // 계산 실패 시 무시
      }
    } else {
      const newValue = currentValue + key;
      onChange({ target: { value: newValue } } as React.ChangeEvent<HTMLInputElement>);
    }
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
              ref={input1Ref}
              type="text"
              value={input1}
              onChange={handleInput1Change}
              onFocus={() => setActiveInput(1)}
              style={{ width: 'calc(80% - 2px)', fontSize: '16px', padding: '8px', boxSizing: 'border-box', border: activeInput === 1 ? '2px solid #1976d2' : '1px solid #ccc' }}
              placeholder="금액"
              inputMode="none"
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
              onFocus={() => setActiveInput(2)}
              style={{ width: 'calc(80% - 2px)', fontSize: '16px', padding: '8px', boxSizing: 'border-box', border: activeInput === 2 ? '2px solid #1976d2' : '1px solid #ccc' }}
              placeholder="금액"
              inputMode="none"
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
              onFocus={() => setActiveInput(3)}
              style={{ width: 'calc(80% - 2px)', fontSize: '16px', padding: '8px', boxSizing: 'border-box', border: activeInput === 3 ? '2px solid #1976d2' : '1px solid #ccc' }}
              placeholder="금액"
              inputMode="none"
            />
            <select value={country3} onChange={handleCountry3Change} style={{ width: 'calc(50% - 2px)', fontSize: '14px', padding: '8px', boxSizing: 'border-box' }}>
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.currency}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      {/* 키패드 */}
      <div style={{ marginTop: '16px', background: '#f5f5f5', borderRadius: '8px', padding: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {['7', '8', '9', '/'].map(key => (
            <button
              key={key}
              onClick={() => handleKeypadPress(key)}
              style={{ 
                padding: '16px 8px', 
                fontSize: '18px', 
                fontWeight: '600',
                background: ['+', '-', '*', '/'].includes(key) ? '#ff9800' : '#fff',
                color: ['+', '-', '*', '/'].includes(key) ? '#fff' : '#333',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {key}
            </button>
          ))}
          {['4', '5', '6', '*'].map(key => (
            <button
              key={key}
              onClick={() => handleKeypadPress(key)}
              style={{ 
                padding: '16px 8px', 
                fontSize: '18px', 
                fontWeight: '600',
                background: ['+', '-', '*', '/'].includes(key) ? '#ff9800' : '#fff',
                color: ['+', '-', '*', '/'].includes(key) ? '#fff' : '#333',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {key}
            </button>
          ))}
          {['1', '2', '3', '-'].map(key => (
            <button
              key={key}
              onClick={() => handleKeypadPress(key)}
              style={{ 
                padding: '16px 8px', 
                fontSize: '18px', 
                fontWeight: '600',
                background: ['+', '-', '*', '/'].includes(key) ? '#ff9800' : '#fff',
                color: ['+', '-', '*', '/'].includes(key) ? '#fff' : '#333',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {key}
            </button>
          ))}
          {['C', '0', '.', '+'].map(key => (
            <button
              key={key}
              onClick={() => handleKeypadPress(key)}
              style={{ 
                padding: '16px 8px', 
                fontSize: '18px', 
                fontWeight: '600',
                background: key === 'C' ? '#f44336' : ['+', '-', '*', '/'].includes(key) ? '#ff9800' : '#fff',
                color: (key === 'C' || ['+', '-', '*', '/'].includes(key)) ? '#fff' : '#333',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {key}
            </button>
          ))}
          <button
            onClick={() => handleKeypadPress('⌫')}
            style={{ 
              padding: '16px 8px', 
              fontSize: '18px', 
              fontWeight: '600',
              background: '#9e9e9e',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              gridColumn: 'span 2',
              transition: 'all 0.1s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ⌫
          </button>
          <button
            onClick={() => handleKeypadPress('=')}
            style={{ 
              padding: '16px 8px', 
              fontSize: '18px', 
              fontWeight: '600',
              background: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              gridColumn: 'span 2',
              transition: 'all 0.1s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            =
          </button>
        </div>
      </div>
      
      {/* 환율 정보 안내 문구 제거됨 */}
    </div>
  );
}

export default CurrencyView;
