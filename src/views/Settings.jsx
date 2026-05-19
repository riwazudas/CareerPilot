import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Eye, EyeOff, ShieldCheck, CheckCircle, Database } from 'lucide-react';

export default function Settings({ apiKey, modelName, onSaveSettings, onClearDatabase }) {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [modelSelect, setModelSelect] = useState(
    ['gemini-3.1-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3-flash'].includes(modelName)
      ? modelName
      : 'custom'
  );
  const [customModel, setCustomModel] = useState(
    ['gemini-3.1-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3-flash'].includes(modelName)
      ? ''
      : modelName
  );
  const [showKey, setShowKey] = useState(false);
  const [notification, setNotification] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalModel = modelSelect === 'custom' ? customModel.trim() : modelSelect;
    
    if (!finalModel) {
      alert('Please specify a model name.');
      return;
    }

    onSaveSettings(keyInput.trim(), finalModel);
    triggerNotification('Settings Saved Successfully!');
  };

  const handleClear = () => {
    if (confirm('CAUTION: This will delete ALL tracked jobs, tailored resumes, cover letters, and reset settings back to default. This cannot be undone. Are you absolutely sure?')) {
      onClearDatabase();
      setKeyInput('');
      setModelSelect('gemini-3.1-flash-lite');
      setCustomModel('');
      triggerNotification('Database cleared & reset!');
    }
  };

  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
      <div>
        <h1 className="page-title">System Settings</h1>
        <p className="page-subtitle">Configure your API credentials, model endpoints, and local storage variables.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* API Credentials Card */}
        <div className="glass-card settings-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', marginBottom: '20px' }}>
            <SettingsIcon size={20} className="accent-gradient" />
            <span>Gemini API Configuration</span>
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Gemini API Key</label>
              <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                <input 
                  type={showKey ? 'text' : 'password'} 
                  className="form-control" 
                  placeholder="AIzaSy..." 
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  style={{ paddingRight: '44px' }}
                />
                <button 
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowKey(!showKey)}
                  style={{ 
                    position: 'absolute', 
                    right: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    background: 'transparent'
                  }}
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.4' }}>
                Get an API key for free from the Google AI Studio console. Your key is stored strictly on your local browser and is never processed on external servers.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Active Model</label>
              <select 
                className="form-control" 
                value={modelSelect}
                onChange={(e) => setModelSelect(e.target.value)}
              >
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fastest & Efficient)</option>
                <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-3-flash">Gemini 3 Flash (Advanced Reasoning)</option>
                <option value="custom">Custom Endpoint Model...</option>
              </select>
            </div>

            {modelSelect === 'custom' && (
              <div className="form-group" style={{ animation: 'slideDown var(--transition-fast) forwards' }}>
                <label className="form-label">Custom Model Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. gemini-3.1-flash-lite" 
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  required
                />
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Provide the exact model identifier as per official Google documentation.
                </p>
              </div>
            )}

            <button type="submit" className="glow-btn" style={{ marginTop: '10px' }}>
              <Save size={16} />
              <span>Save System Settings</span>
            </button>
          </form>
        </div>

        {/* Local Storage Database Utilities Card */}
        <div className="glass-card settings-card" style={{ borderLeft: '4px solid var(--color-rejected)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', marginBottom: '12px', color: 'var(--color-rejected)' }}>
            <Database size={20} />
            <span>Danger Zone</span>
          </h2>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.4' }}>
            System state consists of local cookies containing your active resumes, application databases, and AI generation transcripts. If the app feels clogged or you'd like to wipe cache data, perform a database wipe.
          </p>

          <button 
            type="button" 
            className="secondary-btn" 
            style={{ 
              borderColor: 'var(--color-rejected)', 
              color: 'var(--color-rejected)',
              background: 'hsla(355, 80%, 60%, 0.04)' 
            }}
            onClick={handleClear}
          >
            <span>Wipe Storage Database</span>
          </button>
        </div>
      </div>

      {/* Floating success toast indicator */}
      {notification && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle size={18} style={{ color: 'var(--color-offer)' }} />
            <span className="toast-message">{notification}</span>
          </div>
        </div>
      )}
    </div>
  );
}
