import { useState } from 'react';
import './TabView.css';
import CurrencyView from './CurrencyView';
import CalendarView from './CalendarView';
import ConfigView from './ConfigView';

const tabList = [
  { label: '환율', key: 'exchange' },
  { label: '달력', key: 'calendar' },
  { label: '설정', key: 'settings' },
];

function TabView() {
  const [activeTab, setActiveTab] = useState('exchange');

  return (
    <div className="tabview-container">
      <div className="tabview-tabs">
        {tabList.map(tab => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? 'active' : ''}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabview-content">
        {activeTab === 'exchange' && <CurrencyView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'settings' && <ConfigView />}
      </div>
    </div>
  );
}

export default TabView;
