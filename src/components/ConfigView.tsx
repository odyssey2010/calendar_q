import { useState } from 'react';

const countries = [
  { code: 'KR', name: '대한민국' },
  { code: 'AE', name: '아랍에미리트' },
  { code: 'US', name: '미국' },
  { code: 'JP', name: '일본' },
  // 필요시 추가
];

function ConfigView() {
  const [country1, setCountry1] = useState('KR');
  const [country2, setCountry2] = useState('AE');

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 16 }}>
      <h3 style={{ marginBottom: 16 }}>설정</h3>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 500, marginRight: 8 }}>국가1 휴일:</label>
        <select value={country1} onChange={e => setCountry1(e.target.value)} style={{ fontSize: 16, padding: '8px 12px' }}>
          {countries.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ fontWeight: 500, marginRight: 8 }}>국가2 휴일:</label>
        <select value={country2} onChange={e => setCountry2(e.target.value)} style={{ fontSize: 16, padding: '8px 12px' }}>
          {countries.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>
      <div style={{ marginTop: 24, color: '#888', fontSize: 14 }}>
        선택한 국가의 휴일 정보를 가져오는 기능은 추후 연동 예정입니다.
      </div>
    </div>
  );
}

export default ConfigView;
