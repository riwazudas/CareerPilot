import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, Play, RefreshCw, CheckCircle, HelpCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { callGemini } from '../utils/gemini';
import { parseMarkdown } from '../utils/markdownParser';

export default function InterviewPrep({ jobs = [], apiKey, modelName, selectedJobId, setSelectedJobId }) {
  const [activeJob, setActiveJob] = useState(null);
  const [industry, setIndustry] = useState('Technology / Software Engineering');
  const [seniority, setSeniority] = useState('Mid-Level');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');

  const [copiedText, setCopiedText] = useState(false);

  // Sync selection with active job
  useEffect(() => {
    if (selectedJobId) {
      const job = jobs.find(j => j.id === selectedJobId);
      setActiveJob(job || null);
    } else if (jobs.length > 0 && !activeJob) {
      setActiveJob(jobs[0]);
      setSelectedJobId(jobs[0].id);
    }
  }, [selectedJobId, jobs]);

  // Try to pre-fill industry/seniority if we can detect it, or keep defaults
  useEffect(() => {
    if (activeJob) {
      // If job role mentions 'Senior' or 'Lead' or 'MTS', set Seniority
      const role = activeJob.role.toLowerCase();
      if (role.includes('senior') || role.includes('lead') || role.includes('principal') || role.includes('staff')) {
        setSeniority('Senior');
      } else if (role.includes('intern') || role.includes('junior') || role.includes('associate')) {
        setSeniority('Entry');
      } else {
        setSeniority('Mid-Level');
      }
    }
  }, [activeJob]);

  const handleJobChange = (e) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);
    const job = jobs.find(j => j.id === jobId);
    setActiveJob(job || null);
  };

  const handleGeneratePrep = async () => {
    if (!apiKey) {
      alert('Please enter your Gemini API Key in Settings first.');
      return;
    }
    if (!activeJob) {
      alert('Please select a position first.');
      return;
    }

    setIsLoading(true);
    setLoadingStatus('Formulating behavioral questions...');

    const prompt = `You are an interview coach who has prepared candidates for ${industry} roles across all seniority levels.

TASK: Generate realistic interview questions with strong answer frameworks.

INPUTS:
- Target role: ${activeJob.role}
- Industry: ${industry}
- Seniority level: ${seniority}
- Specific company: ${activeJob.company}

DELIVERABLES:

**Section A: Likely Questions (15 total)**
- 5 Behavioral (past experience)
- 5 Technical/Role-specific
- 5 Situational (hypothetical scenarios)

For each question, provide:
- The question itself
- Why they ask it (what they're really assessing)
- Answer framework (not a script—key points to hit)

**Section B: STAR Answer Templates**
For the 3 hardest behavioral questions, provide:
- Situation setup (1 sentence)
- Task framing (1 sentence)
- Action emphasis (2-3 sentences—this is the meat)
- Result with metrics if possible (1 sentence)

CONSTRAINTS:
- Questions should reflect current hiring practices, not outdated "Where do you see yourself in 5 years" clichés
- Include at least 2 questions that probe weaknesses or failures
- Mark any questions as "HIGH PRIORITY" if they appear in 80%+ of interviews for this role

Please structure your response in clean Markdown. Make sure headers are clear.`;

    try {
      setTimeout(() => setLoadingStatus('Drafting engineering scenario situations...'), 1500);
      setTimeout(() => setLoadingStatus('Compiling STAR templates and action bullets...'), 3500);

      const response = await callGemini(apiKey, prompt, modelName);

      const updatedJob = {
        ...activeJob,
        interviewQuestions: response,
        hasInterviewPrep: true
      };

      // We trigger the global edit handler
      const event = new CustomEvent('jobEdited', { detail: updatedJob });
      window.dispatchEvent(event);

      triggerNotification('Interview coach guide prepared!');
    } catch (err) {
      alert(`API Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (activeJob?.interviewQuestions) {
      navigator.clipboard.writeText(activeJob.interviewQuestions);
      triggerNotification('Copied prep guide to clipboard');
    }
  };

  const triggerNotification = (msg) => {
    setCopiedText(msg);
    setTimeout(() => setCopiedText(false), 2000);
  };

  if (jobs.length === 0) {
    return (
      <div className="empty-state">
        <MessageSquare size={48} className="empty-state-icon" />
        <h3 className="empty-state-title">No Active Applications</h3>
        <p className="empty-state-text">Add a position on the Application Tracker before preparing for interviews.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Title */}
      <div>
        <h1 className="page-title">AI Interview Coach</h1>
        <p className="page-subtitle">Generate custom-tailored interview preparation sheets based on specific roles.</p>
      </div>

      <div className="tailor-grid">
        {/* Selector Panel */}
        <div className="glass-card tailor-selector-card">
          <div className="form-group">
            <label className="form-label">Position to Prepare For</label>
            <select 
              className="form-control" 
              value={selectedJobId || ''} 
              onChange={handleJobChange}
            >
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.role} - {job.company}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Target Industry</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Technology / FinTech" 
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Seniority Level</label>
            <select 
              className="form-control" 
              value={seniority}
              onChange={(e) => setSeniority(e.target.value)}
            >
              <option value="Entry">Entry / Graduate</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior</option>
              <option value="Executive">Executive</option>
            </select>
          </div>
        </div>

        {/* Prep Output Panel */}
        <div className="glass-card workspace-pane">
          {isLoading ? (
            <div className="ai-loading-container">
              <div className="spinner"></div>
              <div className="ai-loading-status">{loadingStatus}</div>
              <div className="ai-loading-subtext">
                Your AI coach is analyzing current hiring patterns for {activeJob?.role} at {activeJob?.company} and modeling behavioral STAR matrices. This will take a moment.
              </div>
            </div>
          ) : !activeJob?.hasInterviewPrep ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '350px',
              textAlign: 'center',
              padding: '20px'
            }}>
              <HelpCircle size={40} className="accent-gradient" style={{ marginBottom: '16px', opacity: 0.8 }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Launch Interview Prep Guide</h3>
              <p className="text-muted" style={{ fontSize: '0.88rem', maxWidth: '450px', marginBottom: '24px' }}>
                Create a customized interview guide with 15 highly realistic questions (5 behavioral, 5 technical, 5 situational) and STAR frameworks specific to the {activeJob?.role} role at {activeJob?.company}.
              </p>
              <button className="glow-btn" onClick={handleGeneratePrep}>
                <Play size={16} />
                <span>Generate Prep Guide</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <span className="pane-title">
                  <MessageSquare size={16} />
                  Coached Prep Guide for {activeJob.role}
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="secondary-btn" onClick={handleCopy}>
                    <Sparkles size={14} />
                    <span>Copy Sheet</span>
                  </button>
                  <button className="glow-btn" onClick={handleGeneratePrep}>
                    <RefreshCw size={14} />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>

              {/* Rendered Markdown prep content */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }} className="markdown-body">
                <div dangerouslySetInnerHTML={{ __html: parseMarkdown(activeJob.interviewQuestions) }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating success toast indicator */}
      {copiedText && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle size={18} style={{ color: 'var(--color-offer)' }} />
            <span className="toast-message">{copiedText}</span>
          </div>
        </div>
      )}
    </div>
  );
}
