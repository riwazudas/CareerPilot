import React, { useState } from 'react';
import { Search, Plus, Sliders, MessageSquare, Edit3, Trash2, Calendar, DollarSign, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';
import Stats from '../components/Stats';
import ApplicationModal from '../components/ApplicationModal';

const COLUMNS = [
  { id: 'bookmarked', title: 'Bookmarked', color: 'var(--color-bookmarked)', badgeClass: 'badge-bookmarked' },
  { id: 'applied', title: 'Applied', color: 'var(--color-applied)', badgeClass: 'badge-applied' },
  { id: 'interviewing', title: 'Interviewing', color: 'var(--color-interviewing)', badgeClass: 'badge-interviewing' },
  { id: 'offer', title: 'Offer Received', color: 'var(--color-offer)', badgeClass: 'badge-offer' },
  { id: 'rejected', title: 'Rejected', color: 'var(--color-rejected)', badgeClass: 'badge-rejected' }
];

export default function Dashboard({ jobs = [], onAddJob, onEditJob, onDeleteJob, setActiveView, setSelectedJobForTailor, setSelectedJobForInterview, apiKey, modelName }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job => 
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAddModal = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleMoveStatus = (job, direction) => {
    const currentIndex = COLUMNS.findIndex(col => col.id === job.status);
    let newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < COLUMNS.length) {
      const updatedJob = {
        ...job,
        status: COLUMNS[newIndex].id
      };
      
      // Update date applied automatically
      if (COLUMNS[newIndex].id === 'applied' && !job.dateApplied) {
        updatedJob.dateApplied = new Date().toISOString().split('T')[0];
      }
      
      onEditJob(updatedJob);
    }
  };

  const handleGoToTailor = (job) => {
    setSelectedJobForTailor(job);
    setActiveView('tailor');
  };

  const handleGoToInterview = (job) => {
    setSelectedJobForInterview(job);
    setActiveView('interview');
  };

  return (
    <div className="dashboard-grid">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Application Tracker</h1>
          <p className="page-subtitle">Manage your positions and tailor materials with precision.</p>
        </div>
        <button className="glow-btn" onClick={handleOpenAddModal}>
          <Plus size={18} />
          <span>Add Position</span>
        </button>
      </div>

      <Stats jobs={jobs} />

      {/* Search & Filter Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} className="text-muted" />
        <input 
          type="text" 
          className="form-control" 
          placeholder="Filter by company, title, or keywords..."
          style={{ border: 'none', background: 'transparent', padding: '4px', boxShadow: 'none' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            className="text-btn" 
            style={{ fontSize: '0.85rem' }} 
            onClick={() => setSearchTerm('')}
          >
            Clear
          </button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {COLUMNS.map(column => {
          const columnJobs = filteredJobs.filter(job => job.status === column.id);
          
          return (
            <div key={column.id} className="kanban-column">
              <div className="kanban-header">
                <h3 className="kanban-col-title">
                  <span className="status-dot" style={{ background: column.color, boxShadow: `0 0 6px ${column.color}` }}></span>
                  {column.title}
                </h3>
                <span className="kanban-count">{columnJobs.length}</span>
              </div>
              
              <div className="kanban-cards-wrapper">
                {columnJobs.length === 0 ? (
                  <div style={{ 
                    height: '100px', 
                    border: '1px dashed var(--border)', 
                    borderRadius: 'var(--radius-sm)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--text-dark)',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    padding: '8px'
                  }}>
                    Drop positions here
                  </div>
                ) : (
                  columnJobs.map(job => (
                    <div key={job.id} className="glass-card job-card">
                      <div className="job-card-header">
                        <div onClick={() => handleOpenEditModal(job)} style={{ flexGrow: 1 }}>
                          <h4 className="job-role">{job.role}</h4>
                          <h5 className="job-company">{job.company}</h5>
                        </div>
                        {job.url && (
                          <a href={job.url} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="Visit job page">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>

                      {/* Job Metadata details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {job.salary && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <DollarSign size={12} />
                            <span>{job.salary}</span>
                          </div>
                        )}
                        {job.dateApplied && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            <span>Actioned: {job.dateApplied}</span>
                          </div>
                        )}
                      </div>

                      <div className="job-card-actions">
                        {/* Status switching buttons */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button 
                            className="icon-btn" 
                            disabled={job.status === 'bookmarked'} 
                            onClick={() => handleMoveStatus(job, -1)}
                            title="Move back"
                            style={{ opacity: job.status === 'bookmarked' ? 0.3 : 1 }}
                          >
                            <ArrowLeft size={13} />
                          </button>
                          <button 
                            className="icon-btn" 
                            disabled={job.status === 'rejected'} 
                            onClick={() => handleMoveStatus(job, 1)}
                            title="Move forward"
                            style={{ opacity: job.status === 'rejected' ? 0.3 : 1 }}
                          >
                            <ArrowRight size={13} />
                          </button>
                        </div>

                        {/* Action icons */}
                        <div className="card-action-icons">
                          <button 
                            className="icon-btn" 
                            style={{ color: job.tailoredResume ? 'var(--primary)' : 'var(--text-muted)' }}
                            onClick={() => handleGoToTailor(job)}
                            title="AI Tailoring Lab"
                          >
                            <Sliders size={13} />
                          </button>
                          <button 
                            className="icon-btn" 
                            style={{ color: job.hasInterviewPrep ? 'var(--color-interviewing)' : 'var(--text-muted)' }}
                            onClick={() => handleGoToInterview(job)}
                            title="Interview Prep"
                          >
                            <MessageSquare size={13} />
                          </button>
                          <button 
                            className="icon-btn" 
                            onClick={() => handleOpenEditModal(job)}
                            title="Edit"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button 
                            className="icon-btn" 
                            style={{ color: 'var(--color-rejected)' }}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete this position for ${job.role} at ${job.company}?`)) {
                                onDeleteJob(job.id);
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ApplicationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={editingJob ? onEditJob : onAddJob}
        jobToEdit={editingJob}
        apiKey={apiKey}
        modelName={modelName}
      />
    </div>
  );
}
