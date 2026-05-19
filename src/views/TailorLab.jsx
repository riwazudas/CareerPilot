import React, { useState, useEffect } from 'react';
import { Sliders, FileText, CheckCircle, AlertTriangle, Play, Sparkles, Copy, Printer, Check, ArrowRight } from 'lucide-react';
import { callGemini } from '../utils/gemini';
import { parseMarkdown } from '../utils/markdownParser';

export default function TailorLab({ jobs = [], resumeText, onEditJob, apiKey, modelName, selectedJobId, setSelectedJobId }) {
  const [activeJob, setActiveJob] = useState(null);
  const [activeTab, setActiveTab] = useState('resume'); // 'resume', 'cover'
  const [activeSubTab, setActiveSubTab] = useState('analysis'); // 'analysis', 'ranking', 'tailored', 'changelog'
  
  // Loading states
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  
  // Cover Letter Inputs
  const [strengths, setStrengths] = useState('');
  const [requirements, setRequirements] = useState('');
  const [companyDetail, setCompanyDetail] = useState('');
  const [isExtractingDetails, setIsExtractingDetails] = useState(false);
  const [isLoadingCover, setIsLoadingCover] = useState(false);

  const [copiedText, setCopiedText] = useState(false);

  // Sync selection with dropdown
  useEffect(() => {
    if (selectedJobId) {
      const job = jobs.find(j => j.id === selectedJobId);
      setActiveJob(job || null);
    } else if (jobs.length > 0 && !activeJob) {
      // Default to first job if none selected
      setActiveJob(jobs[0]);
      setSelectedJobId(jobs[0].id);
    }
  }, [selectedJobId, jobs]);

  // Load saved inputs when job changes
  useEffect(() => {
    if (activeJob) {
      setStrengths(activeJob.coverLetterStrengths || '');
      setRequirements(activeJob.coverLetterRequirements || '');
      setCompanyDetail(activeJob.coverLetterAdmiration || '');
    }
  }, [activeJob]);

  const handleJobChange = (e) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);
    const job = jobs.find(j => j.id === jobId);
    setActiveJob(job || null);
  };

  // Helper to parse sections
  const getSubTabContent = () => {
    if (!activeJob) return '';
    
    // We split by headers
    const raw = activeJob.keywordAnalysis || '';
    const text = activeJob.tailoredResumeRaw || '';
    
    if (!text) return '';

    const sections = splitTailoredResponse(text);

    switch (activeSubTab) {
      case 'analysis':
        return sections.keywords || activeJob.keywordAnalysis || 'Run the resume optimizer to view keyword gaps.';
      case 'ranking':
        return sections.ranking || activeJob.priorityRanking || 'Run the resume optimizer to view requirements ranking.';
      case 'tailored':
        return sections.resume || activeJob.tailoredResume || 'Run the resume optimizer to view your tailored resume.';
      case 'changelog':
        return sections.changelog || activeJob.changeLog || 'Run the resume optimizer to view the edits change log.';
      default:
        return '';
    }
  };

  // Parsing function
  function splitTailoredResponse(text) {
    const result = { keywords: '', ranking: '', resume: '', changelog: '' };
    if (!text) return result;

    // Split by Markdown Headers that represent the sections
    const parts = text.split(/(?:#+\s*(?:\d\.\s*)?(?:Keyword\s*Gap\s*Analysis|Priority\s*Ranking|Tailored\s*Resume|Change\s*Log))/gi);

    if (parts.length >= 5) {
      result.keywords = parts[1].trim();
      result.ranking = parts[2].trim();
      result.resume = parts[3].trim();
      result.changelog = parts[4].trim();
    } else {
      // Looser parse fallback
      const keywordIndex = text.toLowerCase().indexOf('keyword gap');
      const rankingIndex = text.toLowerCase().indexOf('priority ranking');
      const resumeIndex = text.toLowerCase().indexOf('tailored resume');
      const changelogIndex = text.toLowerCase().indexOf('change log');

      if (keywordIndex !== -1 && rankingIndex !== -1 && resumeIndex !== -1 && changelogIndex !== -1) {
        result.keywords = text.substring(keywordIndex, rankingIndex).replace(/^[:\s*-]+/g, '').trim();
        result.ranking = text.substring(rankingIndex, resumeIndex).replace(/^[:\s*-]+/g, '').trim();
        result.resume = text.substring(resumeIndex, changelogIndex).replace(/^[:\s*-]+/g, '').trim();
        result.changelog = text.substring(changelogIndex).trim();
      } else {
        // Fallback
        result.resume = text;
      }
    }
    return result;
  }

  // Tailor Resume Trigger
  const handleTailorResume = async () => {
    if (!apiKey) {
      alert('Please enter your Gemini API Key in the Settings view first.');
      return;
    }
    if (!activeJob?.description) {
      alert('Please enter a Job Description for this position by editing it in the Dashboard first.');
      return;
    }

    setIsLoadingResume(true);
    setLoadingStep('Reading resume and job posting...');

    const prompt = `You are a resume optimization specialist who analyzes job postings to identify exactly what hiring managers and ATS systems prioritize.

TASK: Tailor my resume to maximize relevance for a specific position.

INPUTS:
- Target role: ${activeJob.role} at ${activeJob.company}
- Job description: ${activeJob.description}
- My current resume: ${resumeText}

DELIVERABLES:
1. **Keyword Gap Analysis**: List required skills/qualifications from the posting, marking which I have (✓) vs. missing (✗)
2. **Priority Ranking**: Rank the top 5 requirements by emphasis in the posting
3. **Tailored Resume**: Rewritten version with:
   - Summary reframed around their priorities
   - Bullet points reordered/reworded to mirror job language
   - Quantified achievements where possible
4. **Change Log**: Specific edits made and why each improves ATS/recruiter match

CONSTRAINTS:
- Preserve factual accuracy—never fabricate experience
- If I lack a "required" qualification, suggest how to address it (transferable skill, willingness to learn, or acknowledge the gap)
- Flag any red flags I should prepare to address (gaps, overqualification, underqualification)

Please return your response formatted in strict Markdown. Make sure each of the 4 deliverables is clearly separated by a major header (e.g. # Keyword Gap Analysis, # Priority Ranking, # Tailored Resume, # Change Log) so that it can be parsed cleanly.`;

    try {
      setTimeout(() => setLoadingStep('Analyzing keyword gaps with Gemini...'), 1500);
      setTimeout(() => setLoadingStep('Reframing resume summary and bullet points...'), 3500);
      setTimeout(() => setLoadingStep('Generating Change Log and ATS metrics...'), 5500);

      const response = await callGemini(apiKey, prompt, modelName);
      
      const sections = splitTailoredResponse(response);

      const updatedJob = {
        ...activeJob,
        tailoredResumeRaw: response,
        keywordAnalysis: sections.keywords || 'Generated Keyword Analysis',
        priorityRanking: sections.ranking || 'Generated Priority Ranking',
        tailoredResume: sections.resume || response,
        changeLog: sections.changelog || 'Generated Change Log'
      };

      onEditJob(updatedJob);
      setActiveSubTab('analysis');
      triggerCopyNotification('Resume Tailored Successfully!');
    } catch (err) {
      alert(`API Error: ${err.message}`);
    } finally {
      setIsLoadingResume(false);
    }
  };

  // Auto Extract cover details
  const handleAutoExtractCoverDetails = async () => {
    if (!apiKey) {
      alert('Please enter your Gemini API Key in Settings first.');
      return;
    }
    if (!activeJob?.description) {
      alert('Please provide a Job Description to extract details from.');
      return;
    }

    setIsExtractingDetails(true);
    try {
      const strengthsPrompt = `You are an expert recruiter. Analyze this resume:
${resumeText}
Extract 3 or 4 high-level candidate strengths that best align with a role as a ${activeJob.role} at ${activeJob.company}. Return ONLY a concise comma-separated list of these 3-4 strengths, nothing else. Do not add numbers or intro text.`;
      
      const reqsPrompt = `Analyze this job posting:
${activeJob.description}
Identify the top 3 or 4 key hiring requirements. Return ONLY a concise comma-separated list of these requirements, nothing else. Do not add intro text.`;

      const [extractedStrengths, extractedReqs] = await Promise.all([
        callGemini(apiKey, strengthsPrompt, modelName),
        callGemini(apiKey, reqsPrompt, modelName)
      ]);

      setStrengths(extractedStrengths.trim().replace(/^"|"$/g, ''));
      setRequirements(extractedReqs.trim().replace(/^"|"$/g, ''));

      // Save to active job
      const updatedJob = {
        ...activeJob,
        coverLetterStrengths: extractedStrengths.trim(),
        coverLetterRequirements: extractedReqs.trim()
      };
      onEditJob(updatedJob);
      triggerCopyNotification('Qualifications extracted!');
    } catch (err) {
      alert(`Extraction Error: ${err.message}`);
    } finally {
      setIsExtractingDetails(false);
    }
  };

  // Generate Cover Letter
  const handleGenerateCoverLetter = async () => {
    if (!apiKey) {
      alert('Please configure your API Key in Settings.');
      return;
    }
    if (!strengths.trim() || !requirements.trim()) {
      alert('Please fill in candidate strengths and job requirements (or click Auto-Extract).');
      return;
    }

    setIsLoadingCover(true);
    const prompt = `You are a hiring manager who has read thousands of cover letters. You know what makes candidates stand out vs. sound generic.

TASK: Write a cover letter that demonstrates genuine fit—not just enthusiasm.

INPUTS:
- Role: ${activeJob.role} at ${activeJob.company}
- My relevant qualifications: ${strengths}
- Key requirements from posting: ${requirements}
- Something specific about the company I admire: ${companyDetail || "A modern engineering workspace driving technical innovation."}

DELIVERABLES:
A cover letter (250-300 words) structured as:
1. **Opening Hook** (1-2 sentences): Specific connection to company/role—not "I'm excited to apply"
2. **Value Proof** (2-3 sentences): One concrete achievement that maps to their top requirement
3. **Fit Statement** (2-3 sentences): Why this role specifically, not just any role
4. **Close** (1 sentence): Clear call to action

CONSTRAINTS:
- No clichés: "passionate," "team player," "excited about this opportunity"
- Every sentence must provide information my resume doesn't
- Tone: Confident without arrogance, specific without rambling
- If I lack a stated requirement, do NOT mention it—focus on strengths

Please return the cover letter body directly, starting with a clean address block (date, company, hiring team) at the top, ready for printing.`;

    try {
      const response = await callGemini(apiKey, prompt, modelName);

      const updatedJob = {
        ...activeJob,
        coverLetter: response,
        coverLetterStrengths: strengths,
        coverLetterRequirements: requirements,
        coverLetterAdmiration: companyDetail
      };
      
      onEditJob(updatedJob);
      triggerCopyNotification('Cover Letter Created!');
    } catch (err) {
      alert(`API Error: ${err.message}`);
    } finally {
      setIsLoadingCover(false);
    }
  };

  const handleCopyClipboard = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    triggerCopyNotification('Copied to clipboard');
  };

  const triggerCopyNotification = (msg) => {
    setCopiedText(msg);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (jobs.length === 0) {
    return (
      <div className="empty-state">
        <Sliders size={48} className="empty-state-icon" />
        <h3 className="empty-state-title">No Active Applications</h3>
        <p className="empty-state-text">Add a position on the Application Tracker before utilizing the Tailoring Lab.</p>
      </div>
    );
  }

  const subTabContent = getSubTabContent();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* View Header */}
      <div>
        <h1 className="page-title">AI Tailoring Lab</h1>
        <p className="page-subtitle">Align your profile perfectly to secure maximum recruitment matches.</p>
      </div>

      <div className="tailor-grid">
        {/* Left Side: Select job and view stats */}
        <div className="glass-card tailor-selector-card">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Active Position</label>
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

          {activeJob && (
            <div className="active-job-details">
              <h4>{activeJob.role}</h4>
              <p>{activeJob.company}</p>
              
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Job Specs:</span>
                  <span style={{ fontWeight: 600 }}>{activeJob.description ? '✓ Provided' : '✗ Missing'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Optimized Resume:</span>
                  <span style={{ fontWeight: 600, color: activeJob.tailoredResume ? 'var(--color-offer)' : 'var(--text-muted)' }}>
                    {activeJob.tailoredResume ? '✓ Tailored' : 'Pending'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Cover Letter:</span>
                  <span style={{ fontWeight: 600, color: activeJob.coverLetter ? 'var(--color-offer)' : 'var(--text-muted)' }}>
                    {activeJob.coverLetter ? '✓ Created' : 'Pending'}
                  </span>
                </div>
              </div>

              {!activeJob.description && (
                <div style={{ 
                  marginTop: '16px', 
                  background: 'hsla(355, 80%, 60%, 0.12)', 
                  border: '1px solid hsla(355, 80%, 60%, 0.25)', 
                  borderRadius: '6px', 
                  padding: '10px',
                  display: 'flex',
                  gap: '8px',
                  color: 'var(--color-rejected)',
                  fontSize: '0.75rem',
                  lineHeight: '1.4'
                }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>Please edit this position on the Dashboard and add the job description to run optimization.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Tabbed generation workspaces */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="workspace-tabs">
            <button 
              className={`tab-btn ${activeTab === 'resume' ? 'active' : ''}`}
              onClick={() => setActiveTab('resume')}
            >
              <Sliders size={16} />
              <span>Tailor Resume</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'cover' ? 'active' : ''}`}
              onClick={() => setActiveTab('cover')}
            >
              <FileText size={16} />
              <span>Cover Letter Builder</span>
            </button>
          </div>

          {/* TAB 1: TAILOR RESUME WORKSPACE */}
          {activeTab === 'resume' && (
            <div className="glass-card workspace-pane">
              {isLoadingResume ? (
                <div className="ai-loading-container">
                  <div className="spinner"></div>
                  <div className="ai-loading-status">{loadingStep}</div>
                  <div className="ai-loading-subtext">
                    Our AI specialist is reviewing credentials, re-indexing structures, and generating your custom deliverables. This will take a few moments.
                  </div>
                </div>
              ) : !activeJob?.tailoredResume ? (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '350px',
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  <Sparkles size={40} className="accent-gradient" style={{ marginBottom: '16px', opacity: 0.8 }} />
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Optimize Profile to Target Fit</h3>
                  <p className="text-muted" style={{ fontSize: '0.88rem', maxWidth: '400px', marginBottom: '24px' }}>
                    Match your extended credentials against this job posting. We'll build a keyword audit, requirements prioritizer, customized resume markdown, and an ATS matching log.
                  </p>
                  <button 
                    className="glow-btn" 
                    onClick={handleTailorResume}
                    disabled={!activeJob?.description}
                  >
                    <Play size={16} />
                    <span>Optimize Resume & Analyze Gaps</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Top toolbar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div className="sub-workspace-tabs" style={{ marginBottom: 0 }}>
                      <button 
                        className={`sub-tab-btn ${activeSubTab === 'analysis' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('analysis')}
                      >
                        Gap Analysis
                      </button>
                      <button 
                        className={`sub-tab-btn ${activeSubTab === 'ranking' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('ranking')}
                      >
                        Priority Ranking
                      </button>
                      <button 
                        className={`sub-tab-btn ${activeSubTab === 'tailored' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('tailored')}
                      >
                        Tailored Resume
                      </button>
                      <button 
                        className={`sub-tab-btn ${activeSubTab === 'changelog' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('changelog')}
                      >
                        Change Log
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="secondary-btn" 
                        style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                        onClick={() => handleCopyClipboard(subTabContent)}
                      >
                        <Copy size={14} />
                        <span>Copy Block</span>
                      </button>
                      <button 
                        className="glow-btn" 
                        style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                        onClick={handleTailorResume}
                      >
                        <RefreshCw size={14} />
                        <span>Regenerate</span>
                      </button>
                    </div>
                  </div>

                  {/* Rendered content */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                    {activeSubTab === 'tailored' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ 
                          background: 'hsla(224, 20%, 80%, 0.03)', 
                          border: '1px solid var(--border)', 
                          borderRadius: '6px', 
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem'
                        }}>
                          <span className="text-muted">Copy this markdown below to use in your customized resume.</span>
                          <button 
                            className="text-btn" 
                            style={{ color: 'var(--primary)' }}
                            onClick={() => handleCopyClipboard(subTabContent)}
                          >
                            <Copy size={12} />
                            <span>Copy Raw Markdown</span>
                          </button>
                        </div>
                        <div className="resume-preview glass-card" style={{ maxHeight: '500px' }}>
                          <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(subTabContent) }} />
                        </div>
                      </div>
                    ) : (
                      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(subTabContent) }} />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COVER LETTER BUILDER WORKSPACE */}
          {activeTab === 'cover' && (
            <div className="glass-card workspace-pane">
              {isLoadingCover ? (
                <div className="ai-loading-container">
                  <div className="spinner"></div>
                  <div className="ai-loading-status">Drafting cover letter details...</div>
                  <div className="ai-loading-subtext">
                    Our persona recruiter is constructing a captivating opening hook, embedding structural value proofs, and formulating a perfect company alignment.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Inputs Section */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label className="form-label" style={{ margin: 0 }}>My Top Strengths *</label>
                          <button 
                            type="button"
                            className="text-btn" 
                            style={{ fontSize: '0.75rem', color: 'var(--primary)' }}
                            onClick={handleAutoExtractCoverDetails}
                            disabled={isExtractingDetails || !activeJob?.description}
                          >
                            {isExtractingDetails ? 'Extracting...' : 'Auto-Extract Strengths'}
                          </button>
                        </div>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="e.g. 5+ years oauth auth systems, REST API design, rate limiting"
                          value={strengths}
                          onChange={(e) => setStrengths(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Top Hiring Requirements *</label>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="e.g. Microservices, backend API reliability, Python/Go"
                          value={requirements}
                          onChange={(e) => setRequirements(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">What do you admire about the company? (Optional detail)</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="e.g. Your robust developer portal / recent funding expansion / leading RAG open source models"
                        value={companyDetail}
                        onChange={(e) => setCompanyDetail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button 
                      className="glow-btn" 
                      onClick={handleGenerateCoverLetter}
                      disabled={!strengths.trim() || !requirements.trim()}
                    >
                      <Sparkles size={16} />
                      <span>{activeJob?.coverLetter ? 'Regenerate Cover Letter' : 'Generate Cover Letter'}</span>
                    </button>
                  </div>

                  {/* Rendered Letter block */}
                  {activeJob?.coverLetter && (
                    <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                      <div className="cover-letter-toolbar">
                        <button className="secondary-btn" onClick={() => handleCopyClipboard(activeJob.coverLetter)}>
                          <Copy size={14} />
                          <span>Copy Letter</span>
                        </button>
                        <button className="secondary-btn" onClick={handlePrint}>
                          <Printer size={14} />
                          <span>Print / PDF</span>
                        </button>
                      </div>

                      <div className="cover-letter-paper">
                        <div className="cover-letter-meta">
                          <div>Riwaz Udas</div>
                          <div>udasriwaz@gmail.com | 0451337510</div>
                          <div>Melbourne, VIC, Australia</div>
                          <br />
                          <div>Date: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                          <br />
                          <div>Hiring Manager, Recruitment Team</div>
                          <div>{activeJob.company}</div>
                        </div>

                        <div className="cover-letter-body">
                          {activeJob.coverLetter}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
