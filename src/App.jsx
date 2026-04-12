// src/App.jsx  —  DevSecOps Radar v2.1
import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'https://job-board-api.callansmithmacdonald.workers.dev'

export default function App() {
  const [jobs, setJobs]                 = useState([])
  const [analytics, setAnalytics]       = useState(null)
  const [loading, setLoading]           = useState(true)
  const [loadingMore, setLoadingMore]   = useState(false)
  const [searchInput, setSearchInput]   = useState('')
  const [currentQuery, setCurrentQuery] = useState('')
  const [offset, setOffset]             = useState(0)

  useEffect(() => {
    if (offset === 0) setLoading(true)
    else              setLoadingMore(true)

    const url = new URL(API_URL)
    if (currentQuery) url.searchParams.set('search', currentQuery)
    if (offset)       url.searchParams.set('offset', offset)

    fetch(url.toString())
      .then(r => r.json())
      .then(data => {
        const incoming = data.jobs || []
        setJobs(prev => offset === 0 ? incoming : [...prev, ...incoming])
        setAnalytics(data.analytics || null)
        setLoading(false)
        setLoadingMore(false)
      })
      .catch(err => {
        console.error('Fetch failed:', err)
        setLoading(false)
        setLoadingMore(false)
      })
  }, [currentQuery, offset])

  const handleSearch = e => {
    e.preventDefault()
    setOffset(0)
    setCurrentQuery(searchInput.trim())
  }

  const clearSearch = () => {
    setSearchInput('')
    setCurrentQuery('')
    setOffset(0)
  }

  const loadMore = () => setOffset(prev => prev + 50)

  /* Helpers */
  const fmt = ts =>
    new Date(ts).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })

  const getSource = id => {
    if (id?.startsWith('adzuna')) return { label: 'Adzuna', cls: 'tag-adzuna' }
    return { label: 'Reed', cls: 'tag-reed' }
  }

  /* Progress bar percentage for pagination */
  const total   = analytics?.totalActive || 0
  const pct     = total > 0 ? Math.min(Math.round((jobs.length / total) * 100), 100) : 0
  const hasMore = analytics && jobs.length < total

  return (
    <>
      {/* ── HERO HEADER ─────────────────────────────────── */}
      <header className="site-header">
        <div className="header-inner">

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

      {/* ── APP SHELL ────────────────────────────────────── */}
      <div className="app-shell">

        {/* ── SIDEBAR ────────────────────────────────────── */}
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
              <button type="submit" className="btn-search">Search</button>
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
            <div className="panel" aria-label="Market overview">
              <p className="panel-label">Overview</p>

              {/* ── Analytics badge pills ── */}
              <div className="analytics-badges">

                {/* Active roles — cobalt brand */}
                <div className="badge badge-default" role="status">
                  <span aria-hidden="true">📡</span>
                  <span className="badge-label">Active roles</span>
                  <strong>{analytics.totalActive}</strong>
                </div>

                {/* Avg salary — emerald (positive signal) */}
                {analytics.averageSalary && analytics.averageSalary !== 'N/A' && (
                  <div className="badge badge-success" role="status">
                    <span aria-hidden="true">💷</span>
                    <span className="badge-label">Avg rate</span>
                    <strong>{analytics.averageSalary}</strong>
                  </div>
                )}

                {/* Top hirer — amber (notable, action-worthy) */}
                {analytics.topCompanies?.[0] && (
                  <div className="badge badge-alert" role="status">
                    <span aria-hidden="true">🏆</span>
                    <span className="badge-label">Top hirer</span>
                    <strong>{analytics.topCompanies[0]}</strong>
                  </div>
                )}

              </div>

              {/* Pagination meta */}
              {jobs.length > 0 && (
                <>
                  <div className="panel-divider" />
                  <div className="meta-row">
                    <span>Loaded</span>
                    <strong>{jobs.length} / {total}</strong>
                  </div>
                  {currentQuery && (
                    <div className="meta-row">
                      <span>Matching</span>
                      <strong>"{currentQuery}"</strong>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </aside>

        {/* ── LISTINGS ─────────────────────────────────── */}
        <main aria-label="Job listings">

          <div className="listings-toolbar">
            <p className="listings-count">
              {loading
                ? 'Loading…'
                : <><strong>{jobs.length}</strong> role{jobs.length !== 1 ? 's' : ''} loaded</>
              }
            </p>
            {currentQuery && !loading && (
              <span className="query-tag" role="status">
                🔍 &ldquo;{currentQuery}&rdquo;
              </span>
            )}
          </div>

          {/* ── States ── */}
          {loading ? (
            <div className="state-view" aria-live="polite">
              <div className="dot-loader" aria-hidden="true">
                <span className="dot" /><span className="dot" /><span className="dot" />
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
            <>
              {/* ── Job cards ── */}
              <div className="jobs-grid">
                {jobs.map((job, i) => {
                  const src = getSource(job.id)
                  return (
                    <article
                      key={job.id}
                      className="job-card"
                      style={{ animationDelay: `${Math.min(i, 20) * 0.045}s` }}
                    >
                      {/* Header row: title + source tag */}
                      <div className="job-card-header">
                        <h2 className="job-title">{job.title}</h2>
                        <span
                          className={`source-tag ${src.cls}`}
                          aria-label={`Source: ${src.label}`}
                        >
                          {src.label}
                        </span>
                      </div>

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
                  )
                })}
              </div>

              {/* ── Load More ── */}
              {hasMore && (
                <div className="load-more-wrapper">
                  <p className="load-more-meta">
                    Showing {jobs.length} of {total} roles · {pct}% loaded
                  </p>
                  <div
                    className="load-more-track"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Roles loaded"
                  >
                    <div className="load-more-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <button
                    className="btn-load-more"
                    onClick={loadMore}
                    disabled={loadingMore}
                    aria-label="Load next 50 roles"
                  >
                    {loadingMore ? 'Loading…' : 'Load Next 50 Roles ↓'}
                  </button>
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </>
  )
}
