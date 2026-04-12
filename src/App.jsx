import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const API_URL = "https://job-board-api.callansmithmacdonald.workers.dev"

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setJobs(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch jobs:", err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="page-wrapper">
      <div className="noise-overlay" />

      <header className="site-header">
        <div className="header-inner">
          <div className="header-badge">
            <span className="pulse-dot" />
            Live
          </div>
          <h1 className="site-title">
            <span className="title-flag">🇬🇧</span>
            DevSecOps<br />Job Radar
          </h1>
          <p className="site-subtitle">
            Live aggregation of Python &amp; Security roles across the UK.
          </p>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-value">{jobs.length}</span>
              <span className="stat-label">Open Roles</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-value">Daily</span>
              <span className="stat-label">Updates</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-value">🇬🇧 UK</span>
              <span className="stat-label">Market</span>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Scanning networks for roles…</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">📡</p>
            <p>No roles found in the database.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job, i) => (
              <article
                key={job.id}
                className="job-card"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="card-top">
                  <span className="card-tag">
                    {job.title.toLowerCase().includes('security') || job.title.toLowerCase().includes('sec')
                      ? 'Security'
                      : job.title.toLowerCase().includes('python')
                      ? 'Python'
                      : 'DevSecOps'}
                  </span>
                  <span className="card-date">
                    {new Date(job.timestamp).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short'
                    })}
                  </span>
                </div>

                <h2 className="card-title">{job.title}</h2>

                <div className="card-meta">
                  <div className="meta-company">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                      <polyline points="9,22 9,12 15,12 15,22"/>
                    </svg>
                    {job.company}
                  </div>
                  {job.salary && (
                    <div className="meta-salary">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                      </svg>
                      {job.salary}
                    </div>
                  )}
                </div>

                <a
                  href={job.link}
                  target="_blank"
                  rel="noreferrer"
                  className="apply-btn"
                  aria-label={`Apply for ${job.title} at ${job.company}`}
                >
                  Apply Now
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12,5 19,12 12,19"/>
                  </svg>
                </a>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="site-footer">
        <p>DevSecOps Job Radar &mdash; Updated daily &mdash; UK roles only</p>
      </footer>
    </div>
  )
}

export default App
