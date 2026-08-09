import { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:8080/api/test-notes'

export default function TestApiView() {
  const [inputText, setInputText] = useState('')
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [dbStatus, setDbStatus] = useState({ connected: false, checking: true, message: '' })
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' })

  // Check DB Health
  const checkHealth = async () => {
    setDbStatus(prev => ({ ...prev, checking: true }))
    try {
      const res = await fetch(`${API_BASE_URL}/health`)
      if (res.ok) {
        const data = await res.json()
        setDbStatus({
          connected: true,
          checking: false,
          message: `Connected to PostgreSQL DB (${data.totalSavedNotes} entries saved)`
        })
      } else {
        setDbStatus({
          connected: false,
          checking: false,
          message: 'Backend API reachable, DB status error'
        })
      }
    } catch (err) {
      setDbStatus({
        connected: false,
        checking: false,
        message: 'Backend server not reachable at http://localhost:8080'
      })
    }
  }

  // Fetch all saved notes from DB
  const fetchNotes = async () => {
    setLoading(true)
    try {
      const res = await fetch(API_BASE_URL)
      if (res.ok) {
        const data = await res.json()
        setNotes(data)
      } else {
        showStatus('error', 'Failed to fetch saved notes from API.')
      }
    } catch (err) {
      showStatus('error', 'Error connecting to backend API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
    fetchNotes()
  }, [])

  const showStatus = (type, text) => {
    setStatusMsg({ type, text })
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000)
  }

  // Save text to DB
  const handleSave = async (e) => {
    e.preventDefault()
    if (!inputText.trim()) {
      showStatus('error', 'Please enter text before saving.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputText })
      })

      if (res.ok) {
        const savedNote = await res.json()
        showStatus('success', `Saved successfully to DB (ID: ${savedNote.id})!`)
        setInputText('')
        fetchNotes()
        checkHealth()
      } else {
        const errData = await res.json()
        showStatus('error', errData.error || 'Failed to save text.')
      }
    } catch (err) {
      showStatus('error', 'Network error: backend API on port 8080 might be offline.')
    } finally {
      setLoading(false)
    }
  }

  // Delete text from DB
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        showStatus('success', `Item #${id} deleted from DB.`)
        fetchNotes()
        checkHealth()
      } else {
        showStatus('error', 'Failed to delete item.')
      }
    } catch (err) {
      showStatus('error', 'Network error while deleting.')
    }
  }

  const handleQuickInsert = (sampleText) => {
    setInputText(sampleText)
  }

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Header & Connection status */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚡ Database Text Saver API Test UI
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Test sending text via Spring Boot REST API (`POST /api/test-notes`) and storing directly in Neon PostgreSQL Database.
          </p>
        </div>

        {/* DB Connection Badge */}
        <div className="glass-panel" style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: dbStatus.connected ? '#10b981' : (dbStatus.checking ? '#f59e0b' : '#ef4444'),
            boxShadow: dbStatus.connected ? '0 0 10px #10b981' : 'none'
          }} />
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: dbStatus.connected ? '#6ee7b7' : '#fca5a5' }}>
            {dbStatus.checking ? 'Checking DB Connection...' : (dbStatus.connected ? 'DB Connected' : 'DB Offline / Not Started')}
          </span>
          <button
            onClick={() => { checkHealth(); fetchNotes(); }}
            title="Refresh status"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: '0.25rem' }}
          >
            🔄
          </button>
        </div>
      </div>

      {/* System Alert Status */}
      {statusMsg.text && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
          color: statusMsg.type === 'success' ? '#6ee7b7' : '#fca5a5'
        }}>
          <span>{statusMsg.type === 'success' ? '✅' : '❌'}</span>
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Input Form Card */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1rem', color: '#f8fafc' }}>
          📝 Enter Text to Save in Database
        </h3>

        <form onSubmit={handleSave}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type any test text, notes, JSON string, or record content here..."
            rows={4}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-glass)',
              color: '#f8fafc',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              marginBottom: '1rem'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Quick Sample Presets */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', alignSelf: 'center' }}>Presets:</span>
              <button
                type="button"
                onClick={() => handleQuickInsert('Sample Student Registration Note: Student ID #1042 approved by Admin.')}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#a5b4fc', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                + Student Note
              </button>
              <button
                type="button"
                onClick={() => handleQuickInsert('API Integration Test — Timestamp: ' + new Date().toISOString())}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#a5b4fc', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                + API Timestamp
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="btn-primary"
              style={{ opacity: loading || !inputText.trim() ? 0.6 : 1, cursor: loading || !inputText.trim() ? 'not-allowed' : 'pointer' }}
            >
              {loading ? '⏳ Saving...' : '💾 Save Text to DB'}
            </button>
          </div>
        </form>
      </div>

      {/* Saved Records List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#f8fafc' }}>
          🗄️ Saved DB Records ({notes.length})
        </h3>
        <button
          onClick={fetchNotes}
          style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#a5b4fc',
            padding: '0.4rem 0.9rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh DB List
        </button>
      </div>

      {loading && notes.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading saved texts from database...
        </div>
      ) : notes.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>No records saved in database yet</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Type some text above and click "Save Text to DB" to store it in PostgreSQL.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notes.map((note) => (
            <div
              key={note.id}
              className="glass-panel"
              style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span className="role-badge" style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
                    ID #{note.id}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    📅 {new Date(note.createdAt).toLocaleString()}
                  </span>
                </div>
                <p style={{ color: '#f8fafc', fontSize: '1rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.5 }}>
                  {note.content}
                </p>
              </div>

              <button
                onClick={() => handleDelete(note.id)}
                title="Delete entry from DB"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                🗑️ Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
