import { useEffect, useState } from 'react';

const timeZones = [
  { code: 'UAE', name: '아랍에미리트', timeZone: 'Asia/Dubai' },
  { code: 'KOR', name: '대한민국', timeZone: 'Asia/Seoul' },
  { code: 'USA', name: '미국(동부)', timeZone: 'America/New_York' },
  { code: 'JPN', name: '일본', timeZone: 'Asia/Tokyo' },
];

function TimesView() {
  const [now, setNow] = useState(new Date());
  const [zone1, setZone1] = useState('UAE');
  const [zone2, setZone2] = useState('KOR');
  const [zone3, setZone3] = useState('USA');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (timeZone: string) =>
    now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone,
    });

  const formatDate = (timeZone: string) =>
    now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone,
    });

  const getZone = (code: string) => timeZones.find(zone => zone.code === code) ?? timeZones[0];

  const getZonedDate = (timeZone: string) => new Date(now.toLocaleString('en-US', { timeZone }));

  const getHourAngle = (timeZone: string) => {
    const zoned = getZonedDate(timeZone);
    const hours = zoned.getHours() % 12;
    const minutes = zoned.getMinutes();
    return hours * 30 + minutes * 0.5;
  };

  const getMinuteAngle = (timeZone: string) => {
    const zoned = getZonedDate(timeZone);
    const minutes = zoned.getMinutes();
    const seconds = zoned.getSeconds();
    return minutes * 6 + seconds * 0.1;
  };

  const renderRow = (code: string, onChange: (value: string) => void) => {
    const zone = getZone(code);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, textAlign: 'left', width: '70%' }}>
          <div style={{ color: '#1976d2', fontWeight: 600, marginBottom: 2 }}>{zone.name}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatTime(zone.timeZone)}</div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>{formatDate(zone.timeZone)}</div>
        </div>
        <select
          value={code}
          onChange={e => onChange(e.target.value)}
          style={{ width: '30%', fontSize: 14, padding: '8px', boxSizing: 'border-box'}}
        >
          {timeZones.map(option => (
            <option key={option.code} value={option.code}>
              {option.code}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div
      style={{
        width: '100%',
        margin: '0 auto',
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>세계 시간</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {renderRow(zone1, setZone1)}
        {renderRow(zone2, setZone2)}
        {renderRow(zone3, setZone3)}
      </div>
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #eee' }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>아날로그 시간</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <svg width={220} height={220} viewBox="0 0 220 220" aria-label="Analog clock">
            <circle cx="110" cy="110" r="100" fill="#fafafa" stroke="#e0e0e0" strokeWidth="2" />
            <circle cx="110" cy="110" r="4" fill="#333" />
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const x1 = 110 + Math.cos(angle) * 84;
              const y1 = 110 + Math.sin(angle) * 84;
              const x2 = 110 + Math.cos(angle) * 94;
              const y2 = 110 + Math.sin(angle) * 94;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#bbb" strokeWidth="3" />;
            })}
            <text x="110" y="36" textAnchor="middle" fontSize="14" fill="#666">12</text>
            <text x="186" y="115" textAnchor="middle" fontSize="14" fill="#666">3</text>
            <text x="110" y="196" textAnchor="middle" fontSize="14" fill="#666">6</text>
            <text x="34" y="115" textAnchor="middle" fontSize="14" fill="#666">9</text>
            {(() => {
              const minuteAngle = getMinuteAngle(getZone(zone1).timeZone);
              const rad = (minuteAngle - 90) * (Math.PI / 180);
              const x2 = 110 + Math.cos(rad) * 78;
              const y2 = 110 + Math.sin(rad) * 78;
              return (
                <line
                  x1="110"
                  y1="110"
                  x2={x2}
                  y2={y2}
                  stroke="#333"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })()}
            {[zone1, zone2, zone3].map((code, idx) => {
              const zone = getZone(code);
              const angle = getHourAngle(zone.timeZone);
              const rad = (angle - 90) * (Math.PI / 180);
              const length = 58 - idx * 6;
              const x2 = 110 + Math.cos(rad) * length;
              const y2 = 110 + Math.sin(rad) * length;
              const colors = ['#1976d2', '#d32f2f', '#2e7d32'];
              return (
                <line
                  key={zone.code}
                  x1="110"
                  y1="110"
                  x2={x2}
                  y2={y2}
                  stroke={colors[idx]}
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[zone1, zone2, zone3].map((code, idx) => {
              const zone = getZone(code);
              const colors = ['#1976d2', '#d32f2f', '#2e7d32'];
              return (
                <div key={zone.code} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 6, background: colors[idx], display: 'inline-block' }}></span>
                  <span>{zone.code} 시침</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimesView;
