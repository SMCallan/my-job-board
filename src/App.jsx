// src/App.jsx
import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'https://job-board-api.callansmithmacdonald.workers.dev'

export default function App() {
  const [jobs, setJobs]           = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [currentQuery, setCurrentQuery] = useState('')

  useEffect(() => {
    setLoading(true)
    const url = currentQuery
      ? `${API_URL}?search=${encodeURIComponent(currentQuery)}`
      : API_URL

    fetch(url)
      .then(r => r.json())
      .then(data => {
        setJobs(data.jobs || [])
        setAnalytics(data.analytics || null)
        setLoading(false)
      })
      .catch(err => {
        console.error('Fetch failed:', err)
        setLoading(false)
      })
  }, [currentQuery])

  const handleSearch = e => {
    e.preventDefault()
    setCurrentQuery(searchInput.trim())
  }

  const clearSearch = () => {
    setSearchInput('')
    setCurrentQuery('')
  }

  /* Format date cleanly */
  const fmt = ts =>
    new Date(ts).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })

  return (
    <>
      {/* ── HERO HEADER ─────────────────────────────────── */}
      <header className="site-header">
        <div className="header-inner">

          {/* Left: Brand */}
          <div className="brand-block">
            <p className="brand-eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              Live · London, UK
            </p>
            <h1>
              DevSecOps<span className="brand-accent"> Radar</span>
            </h1>
            <p className="brand-tagline">
              Real-time aggregation of tech &amp; security engineering roles
            </p>
          </div>

          {/* Right: Stat chips (only when data loaded) */}
          {analytics && !loading && (
            <div className="header-stats" aria-label="Board statistics">
              <div className="stat-chip">
                <span className="stat-number">{analytics.totalActive}</span>
                <span className="stat-label">Active Roles</span>
              </div>
              <div className="stat-chip">
                <span className="stat-number">{analytics.timeframe ?? '—'}</span>
                <span className="stat-label">Timeframe</span>
              </div>
            </div>
          )}

        </div>
      </header>

      {/* ── APP SHELL: SIDEBAR + MAIN ────────────────────── */}
      <div className="app-shell">

        {/* ── SIDEBAR ──────────────────────────────────── */}
        <aside className="sidebar" aria-label="Search and overview">

          {/* Search panel */}
          <div className="panel">
            <p className="panel-label">Search Roles</p>
            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="search"
                className="search-input"
                placeholder="Python, AWS, Kubernetes…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                aria-label="Search jobs by keyword"
                autoComplete="off"
              />
              <button type="submit" className="btn-search">
                Search
              </button>
              {currentQuery && (
                <button
                  type="button"
                  className="btn-clear"
                  onClick={clearSearch}
                  aria-label="Clear search filter"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* Analytics overview panel */}
          {analytics && !loading && (
            <div className="panel" aria-label="Analytics overview">
              <p className="panel-label">Overview</p>

              <div className="meta-row">
                <span>Active roles</span>
                <strong>{analytics.totalActive}</strong>
              </div>
              <div className="panel-divider" />
              <div className="meta-row">
                <span>Timeframe</span>
                <strong>{analytics.timeframe}</strong>
              </div>

              {currentQuery && (
                <>
                  <div className="panel-divider" />
                  <div className="meta-row">
                    <span>Matches</span>
                    <strong>{jobs.length}</strong>
                  </div>
                </>
              )}
            </div>
          )}

        </aside>

        {/* ── LISTINGS AREA ─────────────────────────────── */}
        <main className="listings-area" aria-label="Job listings">

          {/* Toolbar row */}
          <div className="listings-toolbar">
            <p className="listings-count">
              {loading
                ? 'Loading…'
                : <><strong>{jobs.length}</strong> role{jobs.length !== 1 ? 's' : ''} found</>
              }
            </p>
            {currentQuery && !loading && (
              <span className="query-tag" role="status">
                🔍 &ldquo;{currentQuery}&rdquo;
              </span>
            )}
          </div>

          {/* States */}
          {loading ? (
            <div className="state-view" aria-live="polite">
              <div className="dot-loader" aria-hidden="true">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
              <p className="state-label">Scanning networks…</p>
              <p className="state-sublabel">Pulling live roles from the pipeline</p>
            </div>

          ) : jobs.length === 0 ? (
            <div className="state-view" aria-live="polite">
              <p className="state-label">No roles matched your search.</p>
              <p className="state-sublabel">Try a different keyword or clear the filter.</p>
            </div>

          ) : (
            <div className="jobs-grid">
              {jobs.map((job, i) => (
                <article
                  key={job.id}
                  className="job-card"
                  style={{ animationDelay: `${i * 0.045}s` }}
                >
                  <h2 className="job-title">{job.title}</h2>

                  <div className="job-company" aria-label={`Company: ${job.company}`}>
                    <span className="company-indicator" aria-hidden="true" />
                    {job.company}
                  </div>

                  {job.salary && (
                    <span className="job-salary" aria-label={`Salary: ${job.salary}`}>
                      {job.salary}
                    </span>
                  )}

                  <footer className="job-footer">
                    <time
                      className="job-date"
                      dateTime={new Date(job.timestamp).toISOString()}
                    >
                      {fmt(job.timestamp)}
                    </time>

                    <a
                      href={job.link}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="apply-btn"
                      aria-label={`Apply for ${job.title} at ${job.company}`}
                    >
                      Apply Now →
                    </a>
                  </footer>
                </article>
              ))}
            </div>
          )}

        </main>
      </div>
    </>
  )
}
