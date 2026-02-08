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
  const [cacheMessage, setCacheMessage] = useState('');

  // 캐시 삭제 함수
  const handleClearCache = async () => {
    try {
      // 모든 캐시 삭제
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      
      // Service Worker 등록 해제
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }
      
      setCacheMessage('✓ 캐시가 삭제되었습니다. 페이지를 새로고침하세요.');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setCacheMessage('✗ 캐시 삭제 중 오류가 발생했습니다.');
      console.error('Cache clear error:', error);
    }
  };

  return (
    <div style={{ width: '100%', margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 12, boxSizing: 'border-box' }}>
      <h3 style={{ marginBottom: 12, fontSize: '1.1rem' }}>설정</h3>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 500, marginRight: 8, fontSize: '0.9rem' }}>국가1 휴일:</label>
        <select value={country1} onChange={e => setCountry1(e.target.value)} style={{ fontSize: 14, padding: '8px 12px' }}>
          {countries.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ fontWeight: 500, marginRight: 8, fontSize: '0.9rem' }}>국가2 휴일:</label>
        <select value={country2} onChange={e => setCountry2(e.target.value)} style={{ fontSize: 14, padding: '8px 12px' }}>
          {countries.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>
      <div style={{ marginTop: 20, color: '#888', fontSize: 13 }}>
        선택한 국가의 휴일 정보를 가져오는 기능은 추후 연동 예정입니다.
      </div>
      
      {/* 캐시 관리 */}
      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e0e0e0' }}>
        <h4 style={{ marginBottom: 12, fontSize: '0.95rem', fontWeight: 600 }}>캐시 관리</h4>
        <button
          onClick={handleClearCache}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '14px',
            background: '#f44336',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#d32f2f'}
          onMouseOut={(e) => e.currentTarget.style.background = '#f44336'}
        >
          캐시 삭제
        </button>
        {cacheMessage && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px 12px', 
            fontSize: '12px',
            background: cacheMessage.includes('✓') ? '#e8f5e9' : '#ffebee',
            color: cacheMessage.includes('✓') ? '#2e7d32' : '#c62828',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            {cacheMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConfigView;
