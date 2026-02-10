import { useState, useEffect } from 'react';
import { fetchHolidays } from '../utils/fetchHolidays';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthDays(year: number, month: number) {
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function getPrevMonthDays(year: number, month: number, count: number) {
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const lastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
  return Array.from({ length: count }, (_, i) => new Date(prevYear, prevMonth, lastDay - count + i + 1));
}

function getNextMonthDays(year: number, month: number, count: number) {
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  return Array.from({ length: count }, (_, i) => new Date(nextYear, nextMonth, i + 1));
}

function CalendarView() {
  const today = new Date();
  const [curYear, setCurYear] = useState(today.getFullYear());
  const [curMonth, setCurMonth] = useState(today.getMonth()); // 0-indexed
  // Example country codes: KR, AE
  const [country1] = useState('KR');
  const [country2] = useState('AE');
  const [holidays1, setHolidays1] = useState<{ date: string, localName: string }[]>([]);
  const [holidays2, setHolidays2] = useState<{ date: string, localName: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const days = getMonthDays(curYear, curMonth);
  const firstWeekDay = days[0].getDay();
  const lastWeekDay = days[days.length - 1].getDay();
  const todayLabel = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Sample holiday highlight (Sundays only)
  const isHoliday = (date: Date) => date.getDay() === 0;

  // Month navigation
  const prevMonth = () => {
    if (curMonth === 0) {
      setCurYear(curYear - 1);
      setCurMonth(11);
    } else {
      setCurMonth(curMonth - 1);
    }
  };
  const nextMonth = () => {
    if (curMonth === 11) {
      setCurYear(curYear + 1);
      setCurMonth(0);
    } else {
      setCurMonth(curMonth + 1);
    }
  };

  // Fetch holidays
  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      fetchHolidays(curYear, country1),
      fetchHolidays(curYear, country2)
    ])
      .then(([h1, h2]) => {
        setHolidays1(h1);
        setHolidays2(h2);
        setLoading(false);
      })
      .catch(e => {
        setError('Failed to load holiday information.' + (e instanceof Error ? ` ${e.message}` : ''));
        setLoading(false);
      });
  }, [curYear, country1, country2]);

  // Extract holidays for the current month
  const getHolidayDays = (holidays: { date: string, localName: string }[]) => {
    return holidays
      .filter(h => {
        const d = new Date(h.date);
        return d.getMonth() === curMonth;
      })
      .map(h => ({ day: new Date(h.date).getDate(), name: h.localName }));
  };
  const holidayDays1 = getHolidayDays(holidays1);
  const holidayDays2 = getHolidayDays(holidays2);

  return (
    <div style={{ width: '100%', margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 0, boxSizing: 'border-box' }}>
      {/* Header: date, month, year, < > buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={prevMonth} style={{ fontSize: 18, padding: '4px 12px' }}>{'<'}</button>
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          {curYear} {curMonth + 1}
        </div>
        <button onClick={nextMonth} style={{ fontSize: 18, padding: '4px 12px' }}>{'>'}</button>
      </div>
      {/* Today */}
      <div style={{ textAlign: 'center', marginBottom: 8, color: '#1976d2', fontWeight: 500, fontSize: '1.08rem' }}>
        Today: {todayLabel}
      </div>
      {/* Weekday header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        {weekDays.map(day => (
          <div key={day} style={{ flex: 1, textAlign: 'center', fontWeight: 600, color: '#888', fontSize: '0.85rem' }}>{day}</div>
        ))}
      </div>
      {/* Date grid */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#888' }}>Loading holiday information...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', color: 'red' }}>{error}</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {/* First week blanks: previous month dates (dimmed) */}
          {getPrevMonthDays(curYear, curMonth, firstWeekDay).map((date, idx) => (
            <div
              key={'prev-' + idx}
              style={{
                flex: '1 0 14%',
                minHeight: 96,
                maxHeight: 96,
                textAlign: 'center',
                marginBottom: 2,
                borderRadius: 6,
                background: '#f0f0f0',
                color: '#bbb',
                fontWeight: 400,
                fontSize: '1.275rem',
              }}
            >
              {date.getDate()}
            </div>
          ))}
          {/* Current month dates */}
          {days.map(date => {
            const day = date.getDate();
            const korHolidays = holidayDays1.filter(h => h.day === day);
            const uaeHolidays = holidayDays2.length > 0 ? holidayDays2.filter(h => h.day === day) : [];
            const isToday = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && day === today.getDate();
            return (
              <div
                key={day}
                style={{
                  flex: '1 0 14%',
                  minHeight: 96,
                  maxHeight: 96,
                  textAlign: 'center',
                  marginBottom: 2,
                  borderRadius: 6,
                  background: isHoliday(date) ? '#ffe0e0' : '#f5f5f5',
                  color: isHoliday(date) ? '#d32f2f' : '#333',
                  fontWeight: isHoliday(date) ? 700 : 400,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  paddingBottom: 0,
                  border: isToday ? '2px solid #1976d2' : undefined,
                  boxShadow: isToday ? '0 0 0 2px #90caf9' : undefined,
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ position: 'absolute', left: 4, right: 4, bottom: 12, fontSize: 10, color: '#1976d2', whiteSpace: 'pre-line', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>
                  {korHolidays.map(h => h.name).join('\n')}
                  {uaeHolidays.length > 0 && korHolidays.length > 0 ? '\n' : ''}
                  {uaeHolidays.map(h => h.name).join('\n')}
                </div>
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 2, height: 6, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  {korHolidays.length > 0 && (
                    <div style={{ height: 4, width: '100%', background: '#1976d2', borderRadius: 2 }} title={korHolidays.map(h => h.name).join(', ')}></div>
                  )}
                  {uaeHolidays.length > 0 && (
                    <div style={{ height: 4, width: '100%', background: '#d32f2f', borderRadius: 2, marginLeft: korHolidays.length > 0 ? 2 : 0 }} title={uaeHolidays.map(h => h.name).join(', ')}></div>
                  )}
                </div>
                <div style={{ fontSize: 21, fontWeight: 'bold', marginBottom: 'auto', marginTop: 2 }}>{day}</div>
              </div>
            );
          })}
          {/* Last week blanks: next month dates (dimmed) */}
          {getNextMonthDays(curYear, curMonth, 6 - lastWeekDay).map((date, idx) => (
            <div
              key={'next-' + idx}
              style={{
                flex: '1 0 14%',
                minHeight: 96,
                maxHeight: 96,
                textAlign: 'center',
                marginBottom: 2,
                borderRadius: 6,
                background: '#f0f0f0',
                color: '#bbb',
                fontWeight: 400,
                fontSize: '1.275rem',
              }}
            >
              {date.getDate()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CalendarView;
