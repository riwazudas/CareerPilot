import React from 'react';
import { Briefcase, Calendar, MessageSquare, Award } from 'lucide-react';

export default function Stats({ jobs = [] }) {
  const total = jobs.length;
  const applied = jobs.filter(j => j.status === 'applied').length;
  const interviewing = jobs.filter(j => j.status === 'interviewing').length;
  const offers = jobs.filter(j => j.status === 'offer').length;
  const bookmarked = jobs.filter(j => j.status === 'bookmarked').length;
  const rejected = jobs.filter(j => j.status === 'rejected').length;

  const activeLeads = applied + interviewing + bookmarked + offers;

  // Calculate interview conversion (Interviewing / Applied + Interviewing + Rejected + Offers)
  const totalProcessed = jobs.filter(j => j.status !== 'bookmarked').length;
  const interviewRate = totalProcessed > 0 
    ? Math.round(((interviewing + offers) / totalProcessed) * 100) 
    : 0;

  const offerRate = totalProcessed > 0
    ? Math.round((offers / totalProcessed) * 100)
    : 0;

  return (
    <div className="stats-row">
      <div className="glass-card stat-card">
        <div className="stat-icon-wrapper" style={{ color: 'var(--primary)' }}>
          <Briefcase size={22} />
        </div>
        <div>
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total Jobs Tracked</div>
        </div>
      </div>

      <div className="glass-card stat-card">
        <div className="stat-icon-wrapper" style={{ color: 'var(--color-applied)' }}>
          <Calendar size={22} />
        </div>
        <div>
          <div className="stat-value">{applied}</div>
          <div className="stat-label">Applied</div>
        </div>
      </div>

      <div className="glass-card stat-card">
        <div className="stat-icon-wrapper" style={{ color: 'var(--color-interviewing)' }}>
          <MessageSquare size={22} />
        </div>
        <div>
          <div className="stat-value">{interviewing}</div>
          <div className="stat-label">Interviewing</div>
        </div>
      </div>

      <div className="glass-card stat-card">
        <div className="stat-icon-wrapper" style={{ color: 'var(--color-offer)' }}>
          <Award size={22} />
        </div>
        <div>
          <div className="stat-value">{offers}</div>
          <div className="stat-label">Offers Received</div>
        </div>
      </div>

      <div className="glass-card stat-card">
        <div className="stat-icon-wrapper" style={{ color: 'var(--secondary)' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>%</span>
        </div>
        <div>
          <div className="stat-value">{interviewRate}%</div>
          <div className="stat-label">Interview Conversion</div>
        </div>
      </div>
    </div>
  );
}
