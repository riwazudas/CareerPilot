import React, { useState, useEffect } from 'react';
import { Sliders, FileText, CheckCircle, AlertTriangle, Play, Sparkles, Copy, Printer, Check, ArrowRight, RefreshCw, FileDown } from 'lucide-react';
import { callGemini } from '../utils/gemini';
import { parseMarkdown } from '../utils/markdownParser';

export default function TailorLab({ jobs = [], resumeText, overleafResumeText, onEditJob, apiKey, modelName, selectedJobId, setSelectedJobId }) {
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
  // Tailor Resume Trigger (LaTeX-specific)
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
    setLoadingStep('Reading LaTeX resume and job posting...');

    const prompt = `You are an elite LaTeX resume tailoring specialist and career strategist.

OBJECTIVE:
Customize my existing Overleaf LaTeX resume for the target role by combining advanced career strategy frameworks while preserving the original template's structure exactly.

INPUTS:
1. Target Role:
${activeJob.role} at ${activeJob.company}

2. Job Description:
${activeJob.description}

3. Base LaTeX Resume (overleaf_resume.md):
${overleafResumeText || 'No baseline LaTeX resume found.'}

4. Master Resume Reference (resume.md):
${resumeText}

OUTPUT FORMAT:
Return exactly these 4 markdown sections in order:

# Keyword Gap Analysis & ATS Optimization
Use the "exact match method" to analyze job posting keywords against my background. Provide a table showing Match Status, Evidence, and Recommended Optimization to pass computer screening. 

# Priority Ranking & Strategy
Rank the top 5 most important requirements for this role based on the job description and briefly explain the strategic positioning required to highlight my matching competencies.

# Tailored Resume
Provide the COMPLETE compile-ready LaTeX document applying the following advanced frameworks to the content:

1. **ATS Scanner Optimizer**: Inject exact-match keywords naturally.
2. **Impactful Bullet Creator**: Rewrite experience bullets using the "CAR formula" (Challenge-Action-Result) with real numbers, business impact, and quantified cost savings/process improvements.
3. **Executive Brand Positioning**: Rewrite the professional summary using the "value hook method" to grab attention instantly with years of experience, biggest wins, and clear direction.
4. **High-Value Skills Organizer**: Reorganize the skills section using the "market priority system," listing demanded skills first.
5. **Leadership Story Builder**: (If applicable) Turn management/senior wins into powerful stories using the "team impact method" showing people development and team growth.
6. **Career Bridge Creator**: Connect past diverse experience to the target role using "problem-solution mapping" to show how my skills fix their challenges.
7. **Education Value Maximizer**: Present education and certifications using the "business relevance filter".
8. **Gap Narrative Builder**: (If applicable) Frame any career gaps using the "growth story technique".
9. **Platform-Specific Optimization**: Ensure the content structure is dense but easily scannable, optimized for ATS and recruiter reading.
10. **Project Success Presenter**: Select and present EXACTLY 3 key projects from the master resume using the "business impact showcase". Provide comprehensive bullet points explaining the basics, technical details, methods, and measurable impact of each.

STRICT REQUIREMENTS:
- Output raw LaTeX only under this section.
- Do NOT use markdown code fences.
- The document MUST begin with \\documentclass and end with \\end{document}.
- Use the provided overleaf_resume.md as the exact structural foundation.
- Preserve ALL original formatting, macros, margins, and packages.
- Expand the resume into a strong 2–3 page version.
- Substantially explain the work experience section by including highly detailed, quantified bullet points showcasing the depth and scope of past roles.
- Ensure EVERY work experience entry has at least 4 to 5 bullet points.
- Ensure EVERY project entry has at least 4 bullet points.
- Keep the certification section from the master resume.
- Do NOT include work rights, visa status, or similar statements.
- Do NOT hallucinate or add any new skills, certifications, tools, languages, or technologies that are not even remotely present in the master resume (resume.md), even if they are highly relevant to the target job description.
- Do NOT fabricate, invent, or embellish any past jobs, employers, dates of employment, projects, degrees, educational institutions, or quantitative results that are not present in the master resume (resume.md). All tailored details and narrative enhancements must be grounded in actual experiences described in the master resume.
- Ensure all LaTeX syntax is valid and fully compilable.

# Change Log
List all major modifications made, including how the specific strategic frameworks (e.g. CAR, value hook, exact match method) were applied.
`;

    try {
      setTimeout(() => setLoadingStep('Analyzing LaTeX and keyword gaps...'), 1500);
      setTimeout(() => setLoadingStep('Optimizing LaTeX sections and content...'), 3500);
      setTimeout(() => setLoadingStep('Generating Change Log and saving...'), 5500);

      const response = await callGemini(apiKey, prompt, modelName);
      
      const sections = splitTailoredResponse(response);

      let finalResume = sections.resume || response;
      // Strip ```latex ... ``` markdown wrapper if present
      finalResume = finalResume.replace(/^```latex\n?/i, '').replace(/```\s*$/, '').trim();

      const updatedJob = {
        ...activeJob,
        tailoredResumeRaw: response,
        keywordAnalysis: sections.keywords || 'Generated Keyword Analysis',
        priorityRanking: sections.ranking || 'Generated Priority Ranking',
        tailoredResume: finalResume,
        changeLog: sections.changelog || 'Generated Change Log'
      };

      onEditJob(updatedJob);
      setActiveSubTab('analysis');
      triggerCopyNotification('LaTeX Resume Tailored!');
    } catch (err) {
      alert(`API Error: ${err.message}`);
    } finally {
      setIsLoadingResume(false);
    }
  };

  // Compile and Export PDF using the backend LaTeX compiler
  const handleCompileLatex = async (type = 'resume') => {
    const isCover = type === 'cover';
    const latexSource = isCover ? activeJob?.coverLetter : activeJob?.tailoredResume;
    
    if (!latexSource) return;

    const setLoading = isCover ? setIsLoadingCover : setIsLoadingResume;
    setLoading(true);
    if (!isCover) setLoadingStep('Compiling LaTeX document on backend server...');

    try {
      const response = await fetch('http://localhost:3001/api/compile-latex', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latexCode: latexSource
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'LaTeX compilation failed. Check your LaTeX syntax.');
      }

      // Download PDF binary stream
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const prefix = isCover ? 'Cover_Letter' : 'Tailored_Resume';
      a.download = `${prefix}_${activeJob.role.replace(/[^a-z0-9]/gi, '_')}_${activeJob.company.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      triggerCopyNotification(`Native LaTeX ${isCover ? 'Cover Letter' : 'Resume'} Exported!`);
    } catch (err) {
      alert(`Compilation Error: ${err.message}`);
    } finally {
      setLoading(false);
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
    const prompt = `You are an expert LaTeX cover letter specialist and master career strategist.

TASK: Write a highly compelling cover letter that demonstrates genuine fit and output it as a complete, compilable LaTeX document. You must combine the following advanced writing frameworks to structure the narrative of the letter.

INPUTS:
- Role: ${activeJob.role} at ${activeJob.company}
- My relevant qualifications: ${strengths}
- Key requirements from posting: ${requirements}
- Something specific about the company I admire: ${companyDetail || "A modern engineering workspace driving technical innovation."}
- Current Date: ${new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
- My Master Resume:
${resumeText}
- Job Description:
${activeJob.description}

DELIVERABLES:
A highly strategic cover letter structured exactly using these psychological and structural frameworks:

1. **Attention Hook Creator**: Use the AIDA+ framework (Attention, Interest, Desire, Action + Relevance). Begin with a high-impact statement connecting ${activeJob.company}'s strategic initiative to my proven solutions.
2. **Value Bridge Builder & Requirements Match**: Combine the CAR-Q technique (Challenge, Action, Result, Quantification) and STAR-T methodology (Situation, Task, Action, Result, Transfer). Highlight parallel experiences matching their exact terminology and priority order. Show problem-solving stories with increasing responsibility. Build capability proof with a nested structure (core competency, verification, application potential).
3. **Standout Story Framer & Growth Mindset**: Use the PEA framework (Problem, Execution, Achievement) and AGL technique (Achievement, Gap identified, Learning implemented). Create story tension with challenge magnitude before revealing the solution, positioning it strategically as a proof point of continuous improvement.
4. **Career Pivot & Industry Insight (Optional/Merge if needed)**: Use the LEAP method and TIP methodology (Trends identified, Implications explained, Positioning suggested). Reframe diverse backgrounds as competitive edges and include forward-looking market analysis.
5. **Work Ethic & Culture Alignment Closer**: Use the VPA technique (Values aligned, Purpose shared, Action requested) and RID framework (Responsibility taken, Initiative demonstrated, Determination proven). Structure with mission connection, values demonstration, and forward-looking enthusiasm, closing with a strong call to action. Incorporate Connection Value (CAP method) if applicable.

STRICT CONSTRAINTS:
- Keep the overall length appropriate for a standard cover letter (approx 350-500 words).
- No clichés: "passionate," "team player," "excited about this opportunity"
- Every sentence must provide information my resume doesn't
- Tone: Confident without arrogance, specific without rambling
- Explicitly state that I have "Full Australian Work Rights".
- Do NOT use long dashes (em dash/en dash), semi-colons, or colons anywhere in the letter.
- Do NOT mention or claim proficiency in any new skills, tools, frameworks, or technologies that are not even remotely present in the master resume (resume.md), even if they are highly relevant to the target job description.
- Do NOT fabricate, invent, or embellish any past jobs, employers, dates of employment, projects, degrees, educational institutions, or quantitative results that are not present in the master resume (resume.md). All tailored details and narrative enhancements must be grounded in actual experiences described in the master resume.

LATEX OUTPUT REQUIREMENTS:
- Provide the COMPLETE, valid, compile-ready LaTeX document using the standard \\article\\ or \\letter\\ class.
- Include a clean, professional header with my details: Riwaz Udas, udasriwaz@gmail.com, 0451337510, Melbourne, VIC, Australia.
- Include the recipient address block and the current date.
- Do NOT wrap it in a markdown code block (i.e., do not use \`\`\`latex or \`\`\`). Output the raw LaTeX code directly.
- Ensure all LaTeX control sequences are perfectly balanced and valid so that it compiles flawlessly.`;

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

  const handleExportPDF = (type = 'both') => {
    if (!activeJob) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups for CareerPilot to generate your PDF.');
      return;
    }

    const title = `${activeJob.company} - ${activeJob.role} Application`;
    
    // Parse Markdown Resume into beautiful print-ready HTML
    const resumeHtml = activeJob.tailoredResume 
      ? parseMarkdown(activeJob.tailoredResume) 
      : '<p>No tailored resume generated yet.</p>';
      
    // Format Cover Letter with paragraphs
    const coverLetterHtml = activeJob.coverLetter
      ? activeJob.coverLetter.replace(/\n/g, '<br />')
      : '<p>No cover letter generated yet.</p>';

    const dateStr = new Date().toLocaleDateString('en-AU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // LaTeX-style Parser
    let styledResumeHtml = resumeHtml;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(resumeHtml, 'text/html');
      
      // 1. Extract Header (Candidate Name and Contact Details)
      const allHeadings = Array.from(doc.querySelectorAll('h1, h2, h3'));
      const nameHeading = allHeadings.find(h => h.tagName === 'H1' || h.tagName === 'H2');
      
      let nameText = 'Riwaz Udas';
      let contactHtml = '';
      let bodyHtml = '';

      if (nameHeading) {
        nameText = nameHeading.textContent;
        
        // Find first real section heading (the next H1 or H2)
        const firstSectionHeading = allHeadings.find(h => 
          (h.tagName === 'H1' || h.tagName === 'H2') && 
          h !== nameHeading
        );
        
        if (firstSectionHeading) {
          const contactElements = [];
          let current = nameHeading.nextSibling;
          while (current && current !== firstSectionHeading) {
            if (current.nodeType === Node.ELEMENT_NODE) {
              if (current.tagName !== 'HR') {
                contactElements.push(current.outerHTML);
              }
            } else if (current.nodeType === Node.TEXT_NODE && current.textContent.trim()) {
              contactElements.push(current.textContent.trim());
            }
            current = current.nextSibling;
          }
          
          // Join details nicely, replacing separators with bullet dots
          const rawContactText = contactElements
            .join(' ')
            .replace(/\s+/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/[|•—–]/g, ' • ')
            .trim();
          
          // Split contact elements by ' • ' and format them with dot dividers
          const parts = rawContactText.split(' • ').map(p => p.trim()).filter(Boolean);
          contactHtml = parts.join(' &nbsp;•&nbsp; ');
          
          // Body starts at firstSectionHeading
          const bodyElements = [];
          current = firstSectionHeading;
          while (current) {
            bodyElements.push(current.nodeType === Node.ELEMENT_NODE ? current.outerHTML : current.textContent);
            current = current.nextSibling;
          }
          bodyHtml = bodyElements.join('\n');
        } else {
          bodyHtml = doc.body.innerHTML;
        }
      } else {
        bodyHtml = doc.body.innerHTML;
      }

      // 2. Parse bodyHtml to identify sections and transform subheadings into double-column LaTeX layouts
      const bodyDoc = parser.parseFromString(bodyHtml, 'text/html');
      
      // Tag major uppercase section headers (e.g. "PROFESSIONAL SUMMARY", "TECHNICAL SKILLS")
      const bodyHeadings = Array.from(bodyDoc.querySelectorAll('h1, h2, h3, h4'));
      bodyHeadings.forEach(h => {
        const text = h.textContent.trim();
        if (text === text.toUpperCase() && text.length > 3) {
          h.className = 'latex-section';
        }
      });

      // Transform experience and education entries into double-column tables
      bodyHeadings.forEach(h => {
        if (h.classList.contains('latex-section')) return;

        // Case 1: single heading containing Company | Role (supporting em-dash, en-dash, and pipes)
        const text = h.textContent.trim();
        const hasSep = text.includes('|') || text.includes('—') || text.includes('–');
        if (hasSep && (h.tagName === 'H2' || h.tagName === 'H3')) {
          const parts = text.split(/[|—–]/).map(p => p.trim());
          const company = parts[0] || '';
          const role = parts[1] || '';

          // Look for next sibling that has location and date
          const next = h.nextElementSibling;
          if (next && (next.tagName === 'P' || next.tagName === 'DIV' || next.tagName === 'EM' || next.tagName === 'STRONG')) {
            const nextText = next.textContent.trim();
            const hasMetaSep = nextText.includes('|') || nextText.includes('—') || nextText.includes('–');
            if (hasMetaSep) {
              const metaParts = nextText.split(/[|—–]/).map(p => p.trim());
              const location = metaParts[0] || '';
              const date = metaParts[1] || '';

              const container = bodyDoc.createElement('div');
              container.className = 'latex-subheading';
              container.innerHTML = `
                <div class="latex-row">
                  <strong class="latex-left">${company}</strong>
                  <span class="latex-right">${date}</span>
                </div>
                <div class="latex-row">
                  <span class="latex-sub-left">${role}</span>
                  <span class="latex-sub-right">${location}</span>
                </div>
              `;
              h.parentNode.insertBefore(container, h);
              h.remove();
              next.remove();
              return;
            }
          }
        }

        // Case 2: standard three-tier (h2 followed by h3 followed by meta)
        if (h.tagName === 'H2') {
          const h3 = h.nextElementSibling;
          if (h3 && h3.tagName === 'H3' && !h3.classList.contains('latex-section')) {
            const meta = h3.nextElementSibling;
            if (meta && (meta.tagName === 'P' || meta.tagName === 'DIV' || meta.tagName === 'EM' || meta.tagName === 'STRONG')) {
              const metaText = meta.textContent.trim();
              const hasMetaSep = metaText.includes('|') || metaText.includes('—') || metaText.includes('–');
              if (hasMetaSep) {
                const parts = metaText.split(/[|—–]/).map(p => p.trim());
                const location = parts[0] || '';
                const date = parts[1] || '';

                const container = bodyDoc.createElement('div');
                container.className = 'latex-subheading';
                container.innerHTML = `
                  <div class="latex-row">
                    <strong class="latex-left">${h.textContent}</strong>
                    <span class="latex-right">${date}</span>
                  </div>
                  <div class="latex-row">
                    <span class="latex-sub-left">${h3.textContent}</span>
                    <span class="latex-sub-right">${location}</span>
                  </div>
                `;
                h.parentNode.insertBefore(container, h);
                h.remove();
                h3.remove();
                meta.remove();
              }
            }
          }
        }
      });

      styledResumeHtml = `
        <div class="latex-header">
          <div class="latex-name">${nameText}</div>
          <div class="latex-contact">${contactHtml}</div>
        </div>
        <div class="latex-body">
          ${bodyDoc.body.innerHTML}
        </div>
      `;
    } catch (err) {
      console.error("LaTeX DOM Parsing failure:", err);
    }

    const contentHtml = `
      <html>
        <head>
          <title>${title}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 12.7mm;
            }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #1a1a1a;
              line-height: 1.4;
              font-size: 10pt;
              margin: 0;
              padding: 0;
            }
            
            /* Print Optimization */
            @media print {
              html, body {
                width: 210mm;
                height: 297mm;
              }
              .page-break {
                page-break-before: always;
              }
            }

            .page-break {
              page-break-before: always;
            }

            /* Premium LaTeX-style Resume Formatting */
            .resume-container {
              max-width: 100%;
              color: #1a1a1a;
            }
            
            .latex-header {
              text-align: center;
              margin-bottom: 12px;
            }
            
            .latex-name {
              font-size: 22pt;
              font-weight: 700;
              color: #000000;
              margin-bottom: 4px;
              letter-spacing: -0.5px;
            }
            
            .latex-contact {
              font-size: 8.5pt;
              color: #1a1a1a;
              margin-bottom: 2px;
            }
            
            .latex-contact a {
              color: #1a1a1a;
              text-decoration: none;
              border-bottom: 1px dotted #4b5563;
            }
            
            .latex-section {
              font-size: 11.5pt;
              font-weight: 700;
              color: #000000;
              border-bottom: 2px solid #d3d3d3; /* 2pt light-grey titlerule */
              padding-bottom: 2px;
              margin-top: 14pt;
              margin-bottom: 6pt;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              display: block;
            }
            
            .latex-body h2,
            .latex-body h3,
            .latex-body h4 {
              font-size: 10pt;
              font-weight: 700;
              color: #000000;
              margin-top: 10pt;
              margin-bottom: 3pt;
            }
            
            .latex-body p {
              font-size: 9.5pt;
              margin: 0 0 6px 0;
              line-height: 1.4;
              text-align: justify;
            }
            
            /* Two-Column LaTeX Subheading */
            .latex-subheading {
              margin-top: 8pt;
              margin-bottom: 4pt;
            }
            
            .latex-row {
              display: flex;
              justify-content: space-between;
              font-size: 9.5pt;
              line-height: 1.3;
            }
            
            .latex-left {
              font-weight: 700;
              color: #000000;
            }
            
            .latex-right {
              font-size: 9pt;
              color: #4b5563;
            }
            
            .latex-sub-left {
              font-style: italic;
              color: #1a1a1a;
            }
            
            .latex-sub-right {
              font-size: 9pt;
              color: #4b5563;
            }
            
            .latex-body strong {
              font-weight: 700;
              color: #000000;
            }
            
            .latex-body ul {
              margin: 0 0 6pt 0;
              padding-left: 15px;
              list-style-type: disc;
            }
            
            .latex-body li {
              font-size: 9.5pt;
              line-height: 1.35;
              margin-bottom: 3px;
              color: #1a1a1a;
            }
            
            .latex-body hr {
              display: none; /* Hide raw page breaks inside body */
            }

            /* Cover Letter Styling */
            .cover-letter-container {
              max-width: 100%;
              font-family: 'Inter', sans-serif;
            }
            .cover-letter-header {
              margin-bottom: 30px;
              line-height: 1.4;
            }
            .cover-letter-header .candidate-name {
              font-size: 18pt;
              font-weight: 700;
              color: #111827;
              margin-bottom: 4px;
            }
            .cover-letter-header .candidate-info {
              color: #4b5563;
              font-size: 9.5pt;
            }
            .cover-letter-recipient {
              margin-bottom: 25px;
              line-height: 1.4;
            }
            .cover-letter-body {
              text-align: justify;
              line-height: 1.6;
              font-size: 10pt;
            }
            .cover-letter-body p {
              margin-bottom: 15px;
            }
          </style>
        </head>
        <body>
          ${type === 'resume' || type === 'both' ? `
            <div class="resume-container">
              ${styledResumeHtml}
            </div>
          ` : ''}

          ${type === 'both' ? '<div class="page-break"></div>' : ''}

          ${type === 'cover' || type === 'both' ? `
            <div class="cover-letter-container">
              <div class="cover-letter-header" style="border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 25px;">
                <div class="candidate-name" style="text-align: center;">Riwaz Udas</div>
                <div class="candidate-info" style="text-align: center;">Melbourne, VIC, Australia | 0451337510 | udasriwaz@gmail.com</div>
              </div>
              <div class="cover-letter-recipient" style="margin-bottom: 30px;">
                <strong>Date:</strong> ${dateStr}<br /><br />
                <strong>To:</strong> Hiring Team / Recruiting Department<br />
                <strong>Company:</strong> ${activeJob.company}<br />
                <strong>Position:</strong> ${activeJob.role}
              </div>
              <div class="cover-letter-body">
                ${coverLetterHtml}
              </div>
            </div>
          ` : ''}

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(contentHtml);
    printWindow.document.close();
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
                      {activeSubTab === 'tailored' && (
                        <button 
                          className="glow-btn" 
                          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                          onClick={handleCompileLatex}
                        >
                          <Sparkles size={14} />
                          <span>Compile & Export PDF</span>
                        </button>
                      )}
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
                          <span className="text-muted">Edit or refine your customized LaTeX source code below before compiling.</span>
                          <button 
                            className="text-btn" 
                            style={{ color: 'var(--primary)' }}
                            onClick={() => handleCopyClipboard(activeJob.tailoredResume)}
                          >
                            <Copy size={12} />
                            <span>Copy LaTeX Source</span>
                          </button>
                        </div>
                        <textarea
                          className="resume-editor"
                          style={{ 
                            fontFamily: 'Consolas, Monaco, monospace', 
                            fontSize: '0.85rem', 
                            height: '500px', 
                            padding: '16px',
                            lineHeight: '1.5',
                            borderRadius: '6px',
                            width: '100%',
                            outline: 'none',
                            resize: 'vertical'
                          }}
                          value={activeJob.tailoredResume}
                          onChange={(e) => {
                            const updatedJob = {
                              ...activeJob,
                              tailoredResume: e.target.value
                            };
                            onEditJob(updatedJob);
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <button
                            className="glow-btn"
                            onClick={handleCompileLatex}
                            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                          >
                            <Sparkles size={16} />
                            <span>Compile & Export PDF (Native LaTeX)</span>
                          </button>
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
                      <div className="cover-letter-toolbar" style={{ justifyContent: 'space-between', display: 'flex', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button className="secondary-btn" onClick={() => handleCopyClipboard(activeJob.coverLetter)}>
                            <Copy size={14} />
                            <span>Copy LaTeX</span>
                          </button>
                        </div>
                        <button 
                          className="glow-btn" 
                          onClick={() => handleCompileLatex('cover')}
                          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                        >
                          <Sparkles size={16} />
                          <span>Compile & Export PDF (Native LaTeX)</span>
                        </button>
                      </div>

                      <div className="resume-editor" style={{ height: '400px', width: '100%', fontFamily: 'monospace', fontSize: '0.85rem', padding: '16px', overflowY: 'auto' }}>
                        <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                          {activeJob.coverLetter}
                        </pre>
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
