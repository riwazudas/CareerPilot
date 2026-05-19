import React from 'react';
import { Briefcase, FileText, Sliders, MessageSquare, Settings as SettingsIcon, ShieldCheck, ShieldAlert, Database, Sun, Moon } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Sidebar({ activeView, setActiveView, hasApiKey, jobsCount, activeModel, syncActive, theme, toggleTheme }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={logo} alt="CareerPilot Logo" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
        <span style={{ 
          background: 'linear-gradient(135deg, var(--text-main) 40%, var(--text-muted) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800
        }}>CareerPilot</span>
      </div>

      <nav className="sidebar-nav">
        <button 
          onClick={() => setActiveView('dashboard')}
          className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
        >
          <Briefcase size={20} />
          <span>Dashboard</span>
          {jobsCount > 0 && (
            <span className="kanban-count" style={{ marginLeft: 'auto', background: 'hsla(224, 20%, 80%, 0.12)' }}>
              {jobsCount}
            </span>
          )}
        </button>

        <button 
          onClick={() => setActiveView('resume')}
          className={`nav-item ${activeView === 'resume' ? 'active' : ''}`}
        >
          <FileText size={20} />
          <span>Extended Resume</span>
        </button>

        <button 
          onClick={() => setActiveView('tailor')}
          className={`nav-item ${activeView === 'tailor' ? 'active' : ''}`}
        >
          <Sliders size={20} />
          <span>Tailoring Lab</span>
        </button>

        <button 
          onClick={() => setActiveView('interview')}
          className={`nav-item ${activeView === 'interview' ? 'active' : ''}`}
        >
          <MessageSquare size={20} />
          <span>Interview Prep</span>
        </button>

        <button 
          onClick={() => setActiveView('settings')}
          className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
        >
          <SettingsIcon size={20} />
          <span>Settings</span>
        </button>
      </nav>

      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Storage Disk Sync Indicator */}
        <div className="api-status" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '4px' }}>
          <Database size={16} style={{ color: syncActive ? 'var(--primary)' : 'var(--color-bookmarked)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, color: syncActive ? 'var(--text-main)' : 'var(--text-muted)' }}>
              {syncActive ? 'Disk Database Sync' : 'Browser Storage Only'}
            </span>
            <span style={{ fontSize: '0.68rem', color: syncActive ? 'var(--color-offer)' : 'var(--color-bookmarked)' }}>
              {syncActive ? 'data/db.json active' : 'Offline local mode'}
            </span>
          </div>
        </div>

        {/* Gemini API Key Indicator */}
        <div className="api-status">
          {hasApiKey ? (
            <>
              <div className="status-dot active"></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Gemini Active</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{activeModel}</span>
              </div>
            </>
          ) : (
            <>
              <div className="status-dot"></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600 }}>API Inactive</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-rejected)' }}>Set key in Settings</span>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'hsla(190, 20%, 50%, 0.1)',
            border: '1px solid var(--border)',
            color: 'var(--text-main)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            justifyContent: 'center',
            marginTop: '8px',
            transition: 'var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'hsla(190, 20%, 50%, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'hsla(190, 20%, 50%, 0.1)'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </div>
    </aside>
  );
}
