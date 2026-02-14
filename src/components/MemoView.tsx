import { useState, useEffect } from 'react';

interface MemoItem {
  id: number;
  text: string;
}

const STORAGE_KEY = 'calendar_q_memos';

function MemoView() {
  const [memos, setMemos] = useState<MemoItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [
        { id: 1, text: '메모 1' },
        { id: 2, text: '메모 2' },
        { id: 3, text: '메모 3' },
      ];
    } catch {
      return [
        { id: 1, text: '메모 1' },
        { id: 2, text: '메모 2' },
        { id: 3, text: '메모 3' },
      ];
    }
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
    } catch (e) {
      console.error('Failed to save memos to localStorage:', e);
    }
  }, [memos]);

  const handleItemClick = (memo: MemoItem) => {
    setEditingId(memo.id);
    setEditText(memo.text);
  };

  const handleSave = () => {
    if (editingId !== null) {
      setMemos(memos.map(memo => 
        memo.id === editingId ? { ...memo, text: editText } : memo
      ));
      setEditingId(null);
      setEditText('');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleAddMemo = () => {
    const newId = memos.length > 0 ? Math.max(...memos.map(m => m.id)) + 1 : 1;
    setMemos([...memos, { id: newId, text: `새 메모 ${newId}` }]);
  };

  const handleDelete = (id: number) => {
    setMemos(memos.filter(memo => memo.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditText('');
    }
  };

  const handleWordLongPress = (word: string) => {
    navigator.clipboard.writeText(word).then(() => {
      setCopiedWord(word);
      setTimeout(() => setCopiedWord(null), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const handleWordMouseDown = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    const timer = window.setTimeout(() => {
      handleWordLongPress(word);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleWordMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const renderTextWithWords = (text: string) => {
    const words = text.split(/\s+/);
    return words.map((word, idx) => (
      <span key={idx}>
        <span
          onMouseDown={(e) => handleWordMouseDown(e, word)}
          onMouseUp={handleWordMouseUp}
          onMouseLeave={handleWordMouseUp}
          onTouchStart={(e) => {
            e.stopPropagation();
            const timer = window.setTimeout(() => {
              handleWordLongPress(word);
            }, 500);
            setLongPressTimer(timer);
          }}
          onTouchEnd={handleWordMouseUp}
          onTouchCancel={handleWordMouseUp}
          style={{
            cursor: 'pointer',
            position: 'relative',
            userSelect: 'none',
            border: copiedWord === word ? '2px solid #1976d2' : 'none',
            borderRadius: copiedWord === word ? 4 : 0,
            padding: copiedWord === word ? '2px 4px' : 0,
            background: copiedWord === word ? '#e3f2fd' : 'transparent',
            transition: 'all 0.2s',
          }}
        >
          {word}
        </span>
        {idx < words.length - 1 ? ' ' : ''}
      </span>
    ));
  };

  return (
    <div style={{ padding: 16 }}>
      {copiedWord && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#333',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: 14,
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          복사됨: {copiedWord}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>메모 목록</h3>
        <button
          onClick={handleAddMemo}
          style={{
            padding: '8px 16px',
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + 추가
        </button>
      </div>

      {editingId === null ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {memos.map(memo => (
            <div
              key={memo.id}
              onClick={() => handleItemClick(memo)}
              style={{
                padding: 12,
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f5f5f5';
                e.currentTarget.style.borderColor = '#1976d2';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
            >
              <span style={{ fontSize: 15, flex: 1 }}>{renderTextWithWords(memo.text)}</span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleDelete(memo.id);
                }}
                style={{
                  padding: '4px 8px',
                  background: '#d32f2f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: 16, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8 }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 600 }}>메모 편집</h4>
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            style={{
              width: '100%',
              minHeight: 150,
              padding: 12,
              fontSize: 15,
              border: '1px solid #ccc',
              borderRadius: 6,
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
            placeholder="메모를 입력하세요..."
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: 10,
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              저장
            </button>
            <button
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: 10,
                background: '#757575',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemoView;
