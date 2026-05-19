import React, { useState, useEffect } from 'react';
import { Edit2, Eye, Copy, RefreshCw, FileText, CheckCircle } from 'lucide-react';
import { parseMarkdown } from '../utils/markdownParser';
import { defaultResume } from '../utils/defaultResume';

export default function ResumeLab({ resumeText, onUpdateResume }) {
  const [editorText, setEditorText] = useState(resumeText);
  const [showNotification, setShowNotification] = useState(false);
  const [activeTab, setActiveTab] = useState('both'); // 'edit', 'preview', 'both'

  // Sync editor state with prop
  useEffect(() => {
    setEditorText(resumeText);
  }, [resumeText]);

  // Handle typing & propagate immediately (autosave)
  const handleChange = (e) => {
    const newText = e.target.value;
    setEditorText(newText);
    onUpdateResume(newText);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your extended resume to the default layout? All unsaved edits will be overridden.')) {
      setEditorText(defaultResume);
      onUpdateResume(defaultResume);
      triggerNotification('Reset to default template');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editorText);
    triggerNotification('Copied raw Markdown to clipboard');
  };

  const triggerNotification = (msg) => {
    setShowNotification(msg);
    setTimeout(() => {
      setShowNotification(false);
    }, 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Extended Resume Lab</h1>
          <p className="page-subtitle">Your comprehensive source of experience, projects, and certifications—kept in memory.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="secondary-btn" onClick={handleCopy} title="Copy Markdown">
            <Copy size={16} />
            <span>Copy Markdown</span>
          </button>
          <button className="secondary-btn" style={{ color: 'var(--color-rejected)' }} onClick={handleReset} title="Reset to Original">
            <RefreshCw size={16} />
            <span>Reset Template</span>
          </button>
        </div>
      </div>

      {/* Pane Layout Control (Responsive helper) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Subtabs for changing view pane */}
        <div className="sub-workspace-tabs">
          <button 
            className={`sub-tab-btn ${activeTab === 'both' ? 'active' : ''}`}
            onClick={() => setActiveTab('both')}
          >
            Split Screen
          </button>
          <button 
            className={`sub-tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            <Edit2 size={12} style={{ marginRight: '4px', display: 'inline' }} />
            Editor Only
          </button>
          <button 
            className={`sub-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <Eye size={12} style={{ marginRight: '4px', display: 'inline' }} />
            Preview Only
          </button>
        </div>

        {/* Real-time Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-offer)' }}>
          <CheckCircle size={14} />
          <span style={{ fontWeight: 500 }}>In-Memory Autosaved</span>
        </div>
      </div>

      {/* Main split panes */}
      <div className="resume-layout" style={{ 
        gridTemplateColumns: activeTab === 'both' ? '1fr 1fr' : '1fr',
        display: activeTab === 'both' ? 'grid' : 'flex'
      }}>
        {/* Left pane: Textarea editor */}
        {(activeTab === 'both' || activeTab === 'edit') && (
          <div className="resume-pane" style={{ flexGrow: 1 }}>
            <div className="resume-pane-header">
              <span className="pane-title">
                <Edit2 size={14} />
                Raw Markdown Source
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {editorText.length} characters
              </span>
            </div>
            <textarea
              className="resume-editor"
              placeholder="Paste your markdown resume here..."
              value={editorText}
              onChange={handleChange}
            />
          </div>
        )}

        {/* Right pane: Beautiful parsed HTML preview */}
        {(activeTab === 'both' || activeTab === 'preview') && (
          <div className="resume-pane" style={{ flexGrow: 1 }}>
            <div className="resume-pane-header">
              <span className="pane-title">
                <Eye size={14} />
                Live Formatted Preview
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Aesthetic Stylesheet
              </span>
            </div>
            <div className="resume-preview glass-card">
              <div 
                className="markdown-body" 
                dangerouslySetInnerHTML={{ __html: parseMarkdown(editorText) }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating success toast indicator */}
      {showNotification && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle size={18} style={{ color: 'var(--color-offer)' }} />
            <span className="toast-message">{showNotification}</span>
          </div>
        </div>
      )}
    </div>
  );
}
