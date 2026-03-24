import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState([
    { text: "System Ready. How can I assist you with campus transparency today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [publicLogs, setPublicLogs] = useState([]);
  const [privateLogs, setPrivateLogs] = useState([]);
  const chatEndRef = useRef(null);

  // Initial Fetching for Context (Simulating UI Awareness)
  useEffect(() => {
    // In a real app, these would come from the backend's logging service
    // For now we assume the frontend might have a light metadata view
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, role: isAdmin ? 'admin' : 'student' }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { text: data.response, isBot: true }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Connection error. Ensure UniGuard Backend is healthy.", isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <h2 style={{ color: '#fff', marginBottom: '40px' }}>UniGuard v1.0</h2>
        <button
          className={`sidebar-btn ${!isAdmin ? 'active' : ''}`}
          onClick={() => setIsAdmin(false)}
        >
          Student Portal
        </button>
        <button
          className={`sidebar-btn ${isAdmin ? 'active' : ''}`}
          onClick={() => setIsAdmin(true)}
        >
          Admin Dashboard
        </button>

        <div style={{ marginTop: 'auto', padding: '20px', fontSize: '0.8rem', color: '#64748b' }}>
          Context Engine: 2.0-Flash<br />
          Status: Operational
        </div>
      </aside>

      {/* Main Content */}
      <main className="content-area">
        <div className="header-row">
          <div>
            <h1>{isAdmin ? 'Crisis Management Dashboard' : 'Transparency Central'}</h1>
            <p style={{ color: '#94a3b8' }}>
              {isAdmin ? 'Actionable protocols for department authorities.' : 'Verified updates to debunk rumors and prevent panic.'}
            </p>
          </div>
          <div className={`badge ${isAdmin ? 'badge-admin' : 'badge-student'}`}>
            {isAdmin ? 'Administrator Mode' : 'Student Access'}
          </div>
        </div>

        {/* Global Statistics (Verified Data Feature 1) */}
        {!isAdmin && (
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Health Center Load</div>
              <div className="stat-value">Normal</div>
              <div style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '8px' }}>● 3 Viral cases documented</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Mess Quality Audit</div>
              <div className="stat-value" style={{ color: '#10b981' }}>Safe</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '8px' }}>Water test: PASSED</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Rumors Debunked</div>
              <div className="stat-value">1</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '8px' }}>Chicken Pox: NEGATIVE</div>
            </div>
          </div>
        )}

        {/* Admin Data List (Feature 3 Support) */}
        {isAdmin && (
          <div className="admin-table-container">
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Room</th>
                  <th>Condition</th>
                  <th>Action Needed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ST2026001</td>
                  <td>204B</td>
                  <td>Acute Viral Fever</td>
                  <td>Isolation Required</td>
                </tr>
                <tr>
                  <td>ST2026045</td>
                  <td>301D</td>
                  <td>Fever/Nausea</td>
                  <td>Testing In progress</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* The Transparency Bot (Feature 1 Cross-Verification) */}
        <h3 style={{ margin: '30px 0 15px' }}>
          {isAdmin ? 'Internal Ops Assistant' : 'AI Transparency Bot'}
        </h3>
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.isBot ? 'msg-bot' : 'msg-user'}`}>
                {m.text}
              </div>
            ))}
            {isLoading && <div className="msg msg-bot">Verifying with departmental logs...</div>}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-area">
            <input
              placeholder={isAdmin ? 'Ask for room protocols or ID lookups...' : 'Ask about mess rumors, health alerts...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="sidebar-btn active" style={{ width: 'auto' }} onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
