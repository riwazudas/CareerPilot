import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { callGemini } from '../utils/gemini';

export default function ApplicationModal({ isOpen, onClose, onSave, jobToEdit, apiKey, modelName }) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('bookmarked');
  const [dateApplied, setDateApplied] = useState('');
  const [description, setDescription] = useState('');

  // AI Extractor states
  const [showExtractor, setShowExtractor] = useState(false);
  const [rawPostingText, setRawPostingText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // When jobToEdit changes (e.g. we open to edit), load its fields
  useEffect(() => {
    if (jobToEdit) {
      setCompany(jobToEdit.company || '');
      setRole(jobToEdit.role || '');
      setSalary(jobToEdit.salary || '');
      setUrl(jobToEdit.url || '');
      setStatus(jobToEdit.status || 'bookmarked');
      setDateApplied(jobToEdit.dateApplied || '');
      setDescription(jobToEdit.description || '');
      setShowExtractor(false);
    } else {
      // Clear fields for new job
      setCompany('');
      setRole('');
      setSalary('');
      setUrl('');
      setStatus('bookmarked');
      // default today's date in YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      setDateApplied(today);
      setDescription('');
      setShowExtractor(false);
    }
  }, [jobToEdit, isOpen]);

  // Adjust date applied based on status change
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if ((newStatus === 'applied' || newStatus === 'interviewing') && !dateApplied) {
      const today = new Date().toISOString().split('T')[0];
      setDateApplied(today);
    }
  };

  const handleAIExtract = async () => {
    if (!apiKey) {
      alert('Please configure your Gemini API Key in Settings first.');
      return;
    }
    if (!rawPostingText.trim()) {
      alert('Please paste the job posting text.');
      return;
    }

    setIsExtracting(true);
    const extractionPrompt = `You are a data extraction specialist. Your task is to extract structured job application information from an unstructured job description.

INPUT TEXT:
"""
${rawPostingText}
"""

Extract the following fields and return them strictly in JSON format:
{
  "company": "Clean Company Name (e.g. SuperAPI)",
  "role": "Clean Job Title (e.g. Elixir Engineer)",
  "salary": "Salary range or compensation details if explicitly mentioned (e.g. $120,000 - $180,000 AUD), otherwise empty string",
  "url": "Application URL if mentioned, otherwise empty string",
  "description": "Clean, formatted markdown job description containing the main role information, tech stack, hiring process details, and requirements. Keep all factual details."
}

Return ONLY raw JSON. Do not include markdown code block tags like \`\`\`json.`;

    try {
      const response = await callGemini(apiKey, extractionPrompt, modelName);
      
      // Handle potential markdown encapsulation
      let cleanJson = response.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
      }

      const parsed = JSON.parse(cleanJson);

      if (parsed.company) setCompany(parsed.company);
      if (parsed.role) setRole(parsed.role);
      if (parsed.salary) setSalary(parsed.salary);
      if (parsed.url) setUrl(parsed.url);
      if (parsed.description) setDescription(parsed.description);

      setShowExtractor(false);
      setRawPostingText('');
    } catch (err) {
      console.error(err);
      alert(`AI Extraction Failed: ${err.message}. Ensure your API Key is valid in Settings and try again.`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) {
      alert('Company and Job Title are required!');
      return;
    }

    const jobData = {
      company: company.trim(),
      role: role.trim(),
      salary: salary.trim(),
      url: url.trim(),
      status,
      dateApplied: (status === 'bookmarked') ? '' : dateApplied,
      description: description.trim()
    };

    if (jobToEdit) {
      jobData.id = jobToEdit.id;
      // Preserve generated tailors
      jobData.keywordAnalysis = jobToEdit.keywordAnalysis;
      jobData.priorityRanking = jobToEdit.priorityRanking;
      jobData.tailoredResume = jobToEdit.tailoredResume;
      jobData.changeLog = jobToEdit.changeLog;
      jobData.coverLetter = jobToEdit.coverLetter;
      jobData.coverLetterStrengths = jobToEdit.coverLetterStrengths;
      jobData.coverLetterAdmiration = jobToEdit.coverLetterAdmiration;
      jobData.interviewQuestions = jobToEdit.interviewQuestions;
      jobData.hasInterviewPrep = jobToEdit.hasInterviewPrep;
    }

    onSave(jobData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{jobToEdit ? 'Edit Position' : 'Add New Position'}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            {/* AI Auto-Fill Panel for New Positions */}
            {!jobToEdit && (
              <div className="glass-card" style={{ 
                padding: '16px', 
                marginBottom: '20px', 
                background: 'hsla(250, 85%, 65%, 0.03)', 
                border: '1px solid hsla(250, 85%, 65%, 0.15)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} className="accent-gradient" />
                    <span>AI Autofill from Posting</span>
                  </span>
                  <button 
                    type="button" 
                    className="text-btn" 
                    style={{ fontSize: '0.8rem', color: 'var(--primary)' }}
                    onClick={() => setShowExtractor(!showExtractor)}
                  >
                    {showExtractor ? 'Hide Panel' : 'Auto-Fill Fields'}
                  </button>
                </div>
                
                {showExtractor && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <textarea
                      className="form-control"
                      placeholder="Paste raw unstructured job description, posting email, or webpage text..."
                      value={rawPostingText}
                      onChange={(e) => setRawPostingText(e.target.value)}
                      style={{ minHeight: '120px', fontSize: '0.85rem' }}
                    />
                    <button
                      type="button"
                      className="glow-btn"
                      style={{ alignSelf: 'flex-end', padding: '8px 16px', fontSize: '0.85rem' }}
                      onClick={handleAIExtract}
                      disabled={isExtracting || !rawPostingText.trim()}
                    >
                      {isExtracting ? (
                        <>
                          <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px', display: 'inline-block', marginRight: '6px' }}></span>
                          <span>Extracting...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Extract Details</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Canva, Atlassian, Google" 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Title / Role *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Frontend Engineer, Product Manager" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  className="form-control"
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="bookmarked">Bookmarked</option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offer Received</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Salary / Comp (Optional)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. $120,000 + Super" 
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Job Posting URL</label>
                <input 
                  type="url" 
                  className="form-control" 
                  placeholder="e.g. https://linkedin.com/jobs/..." 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date Actioned</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={dateApplied}
                  onChange={(e) => setDateApplied(e.target.value)}
                  disabled={status === 'bookmarked'}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Job Description / Requirements</label>
              <textarea 
                className="form-control" 
                placeholder="Paste the job description, key responsibilities, and required qualifications here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ minHeight: '160px' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="glow-btn">
              {jobToEdit ? 'Save Changes' : 'Add Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
