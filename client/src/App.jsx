import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [messages, setMessages] = useState([
    { text: "System Initialized. UniGuard Transparency Engine v2.0 is online. How can I assist you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

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
      setMessages(prev => [...prev, { text: "Connection error. Ensure the Intelligence Backend is active.", isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const attemptLogin = () => {
    if (password === 'admin123') { // Simple prototype password
      setIsAdmin(true);
      setShowLogin(false);
      setPassword('');
      setLoginError('');
      setMessages(prev => [...prev, { text: "Admin clearance granted. Full data node access ready.", isBot: true }]);
    } else {
      setLoginError('Invalid credentials.');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const textContent = e.target.result;
      try {
        const response = await fetch('http://localhost:8001/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text_content: textContent }),
        });
        const data = await response.json();
        if (response.ok) {
          setMessages(prev => [...prev, { text: `✅ File "${file.name}" successfully processed. Knowledge graph updated.`, isBot: true }]);
        } else {
          setMessages(prev => [...prev, { text: `❌ Ingestion failed: ${data.detail}`, isBot: true }]);
        }
      } catch (err) {
        setMessages(prev => [...prev, { text: `❌ Upload error. Is the backend running?`, isBot: true }]);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="dashboard-container">
      
      {/* LOGIN OVERLAY */}
      {showLogin && !isAdmin && (
        <div className="login-overlay">
          <div className="login-box">
            <h2 className="login-title">Admin Authentication</h2>
            <input 
              type="password" 
              className="login-input" 
              placeholder="Enter passcode (admin123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && attemptLogin()}
            />
            {loginError && <p style={{color: '#ef4444', fontSize: '0.8rem', marginBottom: '10px'}}>{loginError}</p>}
            <button className="login-btn" onClick={attemptLogin}>AUTHENTICATE</button>
            <button 
              style={{background: 'transparent', border: 'none', color: '#94a3b8', marginTop: '15px', cursor: 'pointer'}} 
              onClick={() => setShowLogin(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <aside className="glass-panel sidebar">
        <div className="brand">
          <div className="brand-icon"></div>
          UniGuard
        </div>
        
        <div className="nav-menu">
          <button className={`nav-btn ${!isAdmin && !showLogin ? 'active' : ''}`} onClick={() => {setIsAdmin(false); setShowLogin(false);}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Public Access
          </button>
          <button className={`nav-btn ${isAdmin || showLogin ? 'active' : ''}`} onClick={() => {
            if (!isAdmin) setShowLogin(true);
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Command Center
          </button>
        </div>

        <div className="sys-status-widget">
          <div className="sys-label">Engine Status</div>
          <div className="sys-value"><div className="sys-dot"></div> Operational</div>
          <div style={{fontSize: '0.7rem', color: '#64748b', marginTop: '12px'}}>Model: Gemini-2.0-Flash</div>
        </div>
      </aside>

      {/* CENTER OPERATIONS AREA */}
      <main className="operations-center">
        <header className="op-header">
          <div>
            <div className="op-title">Intelligence Terminal</div>
            <div className="op-subtitle">Real-time rumor verification and data querying.</div>
          </div>
          <div className={`role-badge ${isAdmin ? 'badge-admin' : 'badge-student'}`}>
            {isAdmin ? 'CLEARANCE: ADMIN' : 'CLEARANCE: STANDARD'}
          </div>
        </header>

        <div className="chat-log">
          {messages.map((m, i) => (
            <div key={i} className={`msg-wrapper ${m.isBot ? 'bot' : 'user'}`}>
              <div className="msg-bubble">{m.text}</div>
              {m.isBot && i > 0 && m.text.includes("✅") === false && m.text.includes("❌") === false && (
                <div className="msg-footer">
                  <span>Verified by AI</span>
                  <span>•</span>
                  <span className="source-link">View Data Source</span>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className={`msg-wrapper bot`}>
              <div className="msg-bubble" style={{fontStyle: 'italic', color: '#94a3b8'}}>
                Querying Knowledge Base logs...
              </div>
            </div>
          )}
          <div ref={chatEndRef}></div>
        </div>

        <div className="input-box">
          <div className="input-wrapper">
            <input 
              placeholder={isAdmin ? 'Enter command or search protocol (e.g., Isolation status)' : 'Ask about campus health, mess quality, or rumors...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading || isUploading}
            />
            <button className="send-btn" onClick={handleSend} disabled={isLoading || isUploading}>
              SEND
            </button>
          </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR: CAMPUS VITALS */}
      <aside className="glass-panel vitals-panel">
        <div className="vitals-header">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          Campus Vitals Live
        </div>

        <div className="vital-card vc-safe">
          <div className="vc-top">
            <div className="vc-title">Viral Load (Last 24h)</div>
            <div className="vc-icon">⚕️</div>
          </div>
          <div className="vc-main">3 Cases</div>
          <div className="vc-sub">Status: Stable. No outbreaks detected.</div>
        </div>

        <div className="vital-card vc-safe">
          <div className="vc-top">
            <div className="vc-title">Water Potability (B1)</div>
            <div className="vc-icon">💧</div>
          </div>
          <div className="vc-main">150 TDS</div>
          <div className="vc-sub">Bacteria: 0 CFU/ml. Verified Safe.</div>
        </div>

        <div className="vital-card vc-warn">
          <div className="vc-top">
            <div className="vc-title">Mess Quality (B6)</div>
            <div className="vc-icon">🍽️</div>
          </div>
          <div className="vc-main">Yellow Alert</div>
          <div className="vc-sub" style={{color: '#f59e0b'}}>Complaint: Undercooked food (Investigating)</div>
        </div>

        {isAdmin && (
          <div className="upload-zone" onClick={() => fileInputRef.current?.click()} style={{ opacity: isUploading ? 0.5 : 1 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{margin: '0 auto 12px', color: '#94a3b8'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <div className="upload-title">{isUploading ? 'Processing Document...' : 'Ingest Daily Report'}</div>
            <div className="upload-sub">Click to select Text or JSON files for AI ingestion.</div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{display: 'none'}} 
              accept=".txt,.json,.md,.csv" 
              onChange={handleFileUpload} 
            />
          </div>
        )}
      </aside>

    </div>
  );
}

export default App;
