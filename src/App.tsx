import './App.css'
import TabView from './components/TabView'

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#e3f2fd', padding: '16px', boxSizing: 'border-box' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '16px', fontSize: '1.25rem' }}>환율 · 달력 · 설정</h2>
      <TabView />
    </div>
  );
}

export default App
