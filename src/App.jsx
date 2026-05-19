import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import ResumeLab from './views/ResumeLab';
import TailorLab from './views/TailorLab';
import InterviewPrep from './views/InterviewPrep';
import Settings from './views/Settings';
import { defaultResume } from './utils/defaultResume';

// Pre-populated high-quality demonstration jobs
const getSampleJobs = () => {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'sample-canva',
      company: 'Canva',
      role: 'AI Software Engineer',
      salary: '$150,000 - $185,000',
      status: 'applied',
      url: 'https://www.canva.com/careers/',
      dateApplied: today,
      description: 'We are looking for an AI Engineer to join our core intelligence team. You will build scalable RAG pipelines, fine-tune open-source models, and integrate agentic workflows into Canva\'s design suite. Experience with Python, FastAPI, vector databases, and frontend React is highly preferred.',
      // Brief demo material pre-filled
      keywordAnalysis: '| Skill / Requirement | Status | Notes |\n| :--- | :---: | :--- |\n| Large Language Models (LLMs) | ✓ | Master\'s Thesis & extensive project experience |\n| RAG Pipelines | ✓ | Nepal Law AI & Personal RAG chatbot projects |\n| Vector Databases | ✓ | Experience with VectorDB indexings |\n| FastAPI | ✓ | Developed FastAPI backends for multiple projects |\n| React Development | ✓ | Strong React UI skills, Monopoly multiplayer project |\n| Fine-tuning (LoRA) | ✓ | Social Media Geotagging fine-tuning |\n| Graphic Design Systems | ✗ | Willingness to learn Canva\'s core tools |',
      priorityRanking: '1. **Retrieval-Augmented Generation (RAG)**: Heavily emphasized for intelligent content indexing\n2. **Large Language Models & Fine-Tuning**: Vital for custom Canva suggestions\n3. **FastAPI Serving & Vector Search**: Core backend platform capabilities\n4. **React Frontend Integration**: Required to bridge AI inferences to user editors\n5. **Distributed AI Deployment**: Important for high scalability',
      tailoredResume: '# Riwaz Udas\n\nAI Engineer specializing in Canva-relevant RAG pipelines and model fine-tunings...\n*(Run the Resume Lab optimizer to see the full tailors)*',
      changeLog: '- Highlighted **FastAPI AI Serving** and **RAG pipelines** in the professional summary\n- Positioned the **Nepal Law RAG Platform** as the primary technical highlight\n- Quantified PyTorch distributed dataset volumes to mirror Canva-scale requirements',
      coverLetter: '',
      hasInterviewPrep: false
    },
    {
      id: 'sample-atlassian',
      company: 'Atlassian',
      role: 'Senior Platform Engineer (Identity)',
      salary: '$180,000 + Super',
      status: 'interviewing',
      url: 'https://www.atlassian.com/careers',
      dateApplied: today,
      description: 'Join Atlassian\'s Identity Platform team! We build secure authentication services supporting millions of active users worldwide. Key skills required: Golang, Java, microservices architectures, OAuth 2.0, Ory Hydra rate-limiting middleware, SQL query optimization, AWS ECS/EKS deployment, and high-availability operations.',
      // Brief prep demo pre-filled
      hasInterviewPrep: true,
      interviewQuestions: `### Section A: Likely Questions (15 total)

#### Behavioral (Past Experience)
1. **[HIGH PRIORITY] Tell me about a time you resolved a major production incident on a platform supporting millions of users.**
   - *Why they ask:* Assessing Level 3 support capability, incident ownership, and distributed systems diagnosis under pressure.
   - *Answer framework:* Use the STAR method: Describe Byju's OAuth outage, rate-limiting heuristic adjustments, and Prometheus alerts setup.

2. **Describe a situation where you had to optimize resource utilization in a cloud environment.**
   - *Why they ask:* Assessing cost-efficiency and infrastructure optimization skills.
   - *Answer framework:* Explain AWS ECS container life-cycles and Rails cache lifecycle management.

3. **How do you handle disagreements with Platform Security teams regarding DDoS mitigations?**
   - *Why they ask:* Assessing collaboration, diplomacy, and security alignments.
   - *Answer framework:* Detail collaborative rate limit configurations.

[... Run Regenerate to view the full coached sheet ...]

### Section B: STAR Answer Templates

#### Outage Resolution (Byju's Authentication)
- **Situation:** Authentication systems experienced a sudden spike, causing high database CPU bottlenecks.
- **Task:** Diagnose the bottleneck and stabilize the session lifecycle management API.
- **Action:** Implemented sliding-window rate-limiting middleware with IP filtering, and refactored Ruby scripts for session lifecycle cleanups.
- **Result:** Decreased peak resource load by 40% and prevented future session leaks for 2M+ daily active users.`
    }
  ];
};

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('cp_api_key') || '');
  const [modelName, setModelName] = useState(() => localStorage.getItem('cp_model_name') || 'gemini-3.1-flash-lite');
  
  const [resumeText, setResumeText] = useState(() => {
    return localStorage.getItem('cp_resume') || defaultResume;
  });

  const [overleafResumeText, setOverleafResumeText] = useState('');

  const [jobs, setJobs] = useState(() => {
    const savedJobs = localStorage.getItem('cp_jobs');
    if (savedJobs) {
      try {
        return JSON.parse(savedJobs);
      } catch (e) {
        console.error('Failed to parse jobs:', e);
      }
    }
    const samples = getSampleJobs();
    localStorage.setItem('cp_jobs', JSON.stringify(samples));
    return samples;
  });

  const [selectedJobId, setSelectedJobId] = useState(() => {
    return jobs.length > 0 ? jobs[0].id : null;
  });

  // Server synchronization states
  const [syncActive, setSyncActive] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('cp_theme') || 'dark');

  // Apply theme class to body
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
    localStorage.setItem('cp_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // 1. Initial Load: Fetch data from local Node server
  useEffect(() => {
    fetch('http://localhost:3001/api/data')
      .then(res => res.json())
      .then(data => {
        let loadedJobs = jobs;
        let loadedResume = resumeText;
        let loadedKey = apiKey;
        let loadedModel = modelName;

        if (data.jobs !== undefined) {
          setJobs(data.jobs);
          loadedJobs = data.jobs;
        }
        if (data.resumeText !== undefined) {
          setResumeText(data.resumeText);
          loadedResume = data.resumeText;
        }
        if (data.overleafResumeText !== undefined) {
          setOverleafResumeText(data.overleafResumeText);
        }
        if (data.apiKey !== undefined) {
          setApiKey(data.apiKey);
          loadedKey = data.apiKey;
        }
        if (data.modelName !== undefined) {
          setModelName(data.modelName);
          loadedModel = data.modelName;
        }
        
        // Match selection to loaded data
        if (loadedJobs.length > 0) {
          setSelectedJobId(loadedJobs[0].id);
        }

        setSyncActive(true);
        setIsFirstLoad(false);
      })
      .catch(err => {
        console.warn('[CareerPilot DB] Sync server offline. Falling back to browser memory.', err);
        setSyncActive(false);
        setIsFirstLoad(false);
      });
  }, []);

  // 2. Auto-Save: Debounced synchronization to local server on updates
  useEffect(() => {
    if (isFirstLoad) return;

    const delayDebounceFn = setTimeout(() => {
      const dataPayload = {
        jobs,
        resumeText,
        apiKey,
        modelName
      };

      fetch('http://localhost:3001/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataPayload)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSyncActive(true);
        } else {
          setSyncActive(false);
        }
      })
      .catch(err => {
        console.error('[CareerPilot DB] Autosave sync failed:', err);
        setSyncActive(false);
      });
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [jobs, resumeText, apiKey, modelName, isFirstLoad]);

  // Persist edits to jobs
  const saveJobsToStorage = (updatedJobs) => {
    setJobs(updatedJobs);
    localStorage.setItem('cp_jobs', JSON.stringify(updatedJobs));
  };

  // Sync edits across pages using window custom events
  useEffect(() => {
    const handleJobEditedEvent = (e) => {
      const updatedJob = e.detail;
      handleEditJob(updatedJob);
    };

    window.addEventListener('jobEdited', handleJobEditedEvent);
    return () => window.removeEventListener('jobEdited', handleJobEditedEvent);
  }, [jobs]);

  const handleAddJob = (jobData) => {
    const newJob = {
      ...jobData,
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      keywordAnalysis: '',
      priorityRanking: '',
      tailoredResume: '',
      changeLog: '',
      coverLetter: '',
      interviewQuestions: '',
      hasInterviewPrep: false
    };

    const updated = [newJob, ...jobs];
    saveJobsToStorage(updated);
    setSelectedJobId(newJob.id);
  };

  const handleEditJob = (updatedJob) => {
    const updated = jobs.map(job => job.id === updatedJob.id ? updatedJob : job);
    saveJobsToStorage(updated);
  };

  const handleDeleteJob = (jobId) => {
    const updated = jobs.filter(job => job.id !== jobId);
    saveJobsToStorage(updated);
    if (selectedJobId === jobId && updated.length > 0) {
      setSelectedJobId(updated[0].id);
    }
  };

  const handleUpdateResume = (newText) => {
    setResumeText(newText);
    localStorage.setItem('cp_resume', newText);
  };

  const handleSaveSettings = (key, model) => {
    setApiKey(key);
    setModelName(model);
    localStorage.setItem('cp_api_key', key);
    localStorage.setItem('cp_model_name', model);
  };

  const handleClearDatabase = () => {
    localStorage.removeItem('cp_jobs');
    localStorage.removeItem('cp_resume');
    localStorage.removeItem('cp_api_key');
    localStorage.removeItem('cp_model_name');
    
    setApiKey('');
    setModelName('gemini-3.1-flash-lite');
    setResumeText(defaultResume);
    const samples = getSampleJobs();
    setJobs(samples);
    setSelectedJobId(samples[0].id);
  };

  // Select target component to render
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            jobs={jobs}
            onAddJob={handleAddJob}
            onEditJob={handleEditJob}
            onDeleteJob={handleDeleteJob}
            setActiveView={setActiveView}
            setSelectedJobForTailor={(job) => setSelectedJobId(job.id)}
            setSelectedJobForInterview={(job) => setSelectedJobId(job.id)}
            apiKey={apiKey}
            modelName={modelName}
          />
        );
      case 'resume':
        return (
          <ResumeLab 
            resumeText={resumeText}
            onUpdateResume={handleUpdateResume}
          />
        );
      case 'tailor':
        return (
          <TailorLab 
            jobs={jobs}
            resumeText={resumeText}
            overleafResumeText={overleafResumeText}
            onEditJob={handleEditJob}
            apiKey={apiKey}
            modelName={modelName}
            selectedJobId={selectedJobId}
            setSelectedJobId={setSelectedJobId}
          />
        );
      case 'interview':
        return (
          <InterviewPrep 
            jobs={jobs}
            apiKey={apiKey}
            modelName={modelName}
            selectedJobId={selectedJobId}
            setSelectedJobId={setSelectedJobId}
          />
        );
      case 'settings':
        return (
          <Settings 
            apiKey={apiKey}
            modelName={modelName}
            onSaveSettings={handleSaveSettings}
            onClearDatabase={handleClearDatabase}
          />
        );
      default:
        return (
          <Dashboard 
            jobs={jobs}
            onAddJob={handleAddJob}
            onEditJob={handleEditJob}
            onDeleteJob={handleDeleteJob}
            setActiveView={setActiveView}
            setSelectedJobForTailor={(job) => setSelectedJobId(job.id)}
            setSelectedJobForInterview={(job) => setSelectedJobId(job.id)}
            apiKey={apiKey}
            modelName={modelName}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        hasApiKey={!!apiKey}
        jobsCount={jobs.length}
        activeModel={modelName}
        syncActive={syncActive}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main className="content-frame">
        {renderActiveView()}
      </main>
    </div>
  );
}

export default App;
