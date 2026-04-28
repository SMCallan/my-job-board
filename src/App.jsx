import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = 'https://job-board-api.callansmithmacdonald.workers.dev'

const QUICK_FILTERS = [
  { label: 'Secure Full Stack', type: 'search', value: 'full stack security' },
  { label: 'AppSec', type: 'search', value: 'application security' },
  { label: 'Product Security', type: 'search', value: 'product security' },
  { label: 'Platform', type: 'search', value: 'platform engineer' },
  { label: 'DevEx', type: 'search', value: 'developer experience' },
  { label: 'Python', type: 'search', value: 'python' },
  { label: 'TypeScript', type: 'search', value: 'typescript' },
  { label: 'Docker', type: 'search', value: 'docker' },
  { label: 'CI/CD', type: 'search', value: 'ci/cd' },
  { label: 'Cloud Security', type: 'search', value: 'cloud security' },
  { label: 'AI Security', type: 'search', value: 'ai security' },
  { label: 'Low On-Call', type: 'culture', value: 'Low culture risk' },
  { label: '£60k+', type: 'salary', value: 60000 },
]

const ROLE_TRACK_OPTIONS = [
  'Any',
  'Secure Full-Stack',
  'Application Security',
  'Product Security',
  'Platform',
  'DevEx',
  'Cloud Security',
  'DevSecOps',
  'SRE',
  'AI Security',
  'Trust & Safety',
]

const SALARY_BAND_OPTIONS = ['Any', 'Core target', 'Stretch target', 'High-value stretch', 'Unknown']
const CULTURE_OPTIONS = ['Any', 'Low culture risk', 'Check on-call', 'Possible chaos', 'High pressure', 'Unknown']
const STATUS_OPTIONS = ['Reviewing', 'Applied', 'Interview', 'Rejected', 'Archived']

function parseJsonList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function fmtDate(ts) {
  if (!ts) return 'Date unknown'
  const date = new Date(ts)
  if (Number.isNaN(date.getTime())) return 'Date unknown'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getScoreBand(score) {
  if (score >= 75) return 'score-high'
  if (score >= 60) return 'score-good'
  if (score >= 45) return 'score-review'
  return 'score-low'
}

function getScoreLabel(score) {
  if (score >= 75) return 'Apply now'
  if (score >= 60) return 'Worth reviewing'
  if (score >= 45) return 'Check carefully'
  return 'Low fit'
}

function inferRoleTrack(title = '') {
  const t = title.toLowerCase()
  if (t.includes('application security') || t.includes('appsec')) return 'Application Security'
  if (t.includes('product security')) return 'Product Security'
  if (t.includes('platform')) return 'Platform'
  if (t.includes('developer experience') || t.includes('devex') || t.includes('developer tools')) return 'DevEx'
  if (t.includes('cloud security')) return 'Cloud Security'
  if (t.includes('devsecops')) return 'DevSecOps'
  if (t.includes('site reliability') || t.includes('sre')) return 'SRE'
  if (t.includes('ai security') || t.includes('ai evaluation')) return 'AI Security'
  if (t.includes('full stack') || t.includes('full-stack')) return 'Secure Full-Stack'
  return 'General Engineering'
}

function getSource(job) {
  const source = String(job?.source || '').toLowerCase()
  if (source.includes('adzuna') || job.id?.startsWith('adzuna')) {
    return { label: 'Adzuna', cls: 'tag-adzuna' }
  }
  if (source.includes('reed') || job.id?.startsWith('reed')) {
    return { label: 'Reed', cls: 'tag-reed' }
  }
  return { label: 'Unknown', cls: 'tag-unknown' }
}

function filterJobs(jobs, filters) {
  return jobs.filter(job => {
    const score = job.fit_score ?? 0
    const roleTrack = job.role_track || inferRoleTrack(job.title)
    const salaryBand = job.salary_band || 'Unknown'
    const cultureRisk = job.culture_risk || 'Unknown'

    if (filters.minFitScore && score < filters.minFitScore) return false
    if (filters.roleTrackFilter !== 'Any' && roleTrack !== filters.roleTrackFilter) return false
    if (
      filters.salaryBandFilter !== 'Any' &&
      !salaryBand.toLowerCase().includes(filters.salaryBandFilter.toLowerCase())
    ) {
      return false
    }
    if (filters.cultureFilter !== 'Any' && cultureRisk !== filters.cultureFilter) return false
    if (filters.showSavedOnly && !filters.savedJobIds.includes(job.id)) return false
    if (filters.minSalary > 0 && (job.salary_max ?? 0) < filters.minSalary) return false
    return true
  })
}

function sortJobs(jobs, sortMode) {
  const copy = [...jobs]
  switch (sortMode) {
    case 'fit_desc':
      return copy.sort((a, b) => (b.fit_score || 0) - (a.fit_score || 0))
    case 'newest':
      return copy.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
    case 'salary_desc':
      return copy.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0))
    case 'company_asc':
      return copy.sort((a, b) => String(a.company || '').localeCompare(String(b.company || '')))
    default:
      return copy
  }
}

export default function App() {
  const [jobs, setJobs] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)

  const [searchInput, setSearchInput] = useState('')
  const [currentQuery, setCurrentQuery] = useState('')
  const [offset, setOffset] = useState(0)

  const [minFitScore, setMinFitScore] = useState(0)
  const [roleTrackFilter, setRoleTrackFilter] = useState('Any')
  const [salaryBandFilter, setSalaryBandFilter] = useState('Any')
  const [cultureFilter, setCultureFilter] = useState('Any')
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [sortMode, setSortMode] = useState('fit_desc')
  const [minSalaryFilter, setMinSalaryFilter] = useState(0)

  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('savedJobIds') || '[]')
    } catch {
      return []
    }
  })

  const [jobStatuses, setJobStatuses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jobStatuses') || '{}')
    } catch {
      return {}
    }
  })

  useEffect(() => {
    const url = new URL(API_URL)
    if (currentQuery) url.searchParams.set('search', currentQuery)
    if (offset) url.searchParams.set('offset', offset)

    fetch(url.toString())
      .then(r => r.json())
      .then(data => {
        const incoming = data.jobs || []
        setJobs(prev => (offset === 0 ? incoming : [...prev, ...incoming]))
        setAnalytics(data.analytics || null)
        setLoading(false)
        setLoadingMore(false)
      })
      .catch(err => {
        console.error('Fetch failed:', err)
        setError('Could not load roles. Please try again later.')
        setLoading(false)
        setLoadingMore(false)
      })
  }, [currentQuery, offset])

  const handleSearch = e => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setOffset(0)
    setCurrentQuery(searchInput.trim())
  }

  const handleQuickFilter = filter => {
    if (filter.type === 'search') {
      setError(null)
      setSearchInput(filter.value)
      setLoading(true)
      setOffset(0)
      setCurrentQuery(filter.value)
      return
    }
    if (filter.type === 'culture') {
      setCultureFilter(filter.value)
      return
    }
    if (filter.type === 'salary') {
      setMinSalaryFilter(filter.value)
    }
  }

  const resetFilters = () => {
    setSearchInput('')
    setError(null)
    setCurrentQuery('')
    setMinFitScore(0)
    setRoleTrackFilter('Any')
    setSalaryBandFilter('Any')
    setCultureFilter('Any')
    setShowSavedOnly(false)
    setSortMode('fit_desc')
    setMinSalaryFilter(0)
    setLoading(true)
    setOffset(0)
  }

  const toggleSavedJob = jobId => {
    setSavedJobIds(prev => {
      const next = prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
      localStorage.setItem('savedJobIds', JSON.stringify(next))
      return next
    })
  }

  const updateJobStatus = (jobId, status) => {
    setJobStatuses(prev => {
      const next = { ...prev, [jobId]: status }
      localStorage.setItem('jobStatuses', JSON.stringify(next))
      return next
    })
  }

  const filteredJobs = useMemo(
    () =>
      filterJobs(jobs, {
        minFitScore,
        roleTrackFilter,
        salaryBandFilter,
        cultureFilter,
        showSavedOnly,
        savedJobIds,
        minSalary: minSalaryFilter,
      }),
    [jobs, minFitScore, roleTrackFilter, salaryBandFilter, cultureFilter, showSavedOnly, savedJobIds, minSalaryFilter],
  )

  const displayJobs = useMemo(() => sortJobs(filteredJobs, sortMode), [filteredJobs, sortMode])

  const loadedAnalytics = useMemo(() => {
    const scored = jobs.filter(j => typeof j.fit_score === 'number')
    const applyNow = scored.filter(j => j.fit_score >= 75)
    const avgFit = scored.length
      ? Math.round(scored.reduce((sum, j) => sum + j.fit_score, 0) / scored.length)
      : null
    const bestFit = scored.length ? Math.max(...scored.map(j => j.fit_score)) : null
    const coreSalary = jobs.filter(j => String(j.salary_band || '').toLowerCase().includes('core target'))
    const highRisk = jobs.filter(j => String(j.culture_risk || '').toLowerCase().includes('high'))

    return {
      bestFit,
      avgFit,
      applyNowCount: applyNow.length,
      coreSalaryCount: coreSalary.length,
      highRiskCount: highRisk.length,
    }
  }, [jobs])

  const topMatches = useMemo(
    () => displayJobs.filter(job => typeof job.fit_score === 'number' && job.fit_score >= 75).slice(0, 3),
    [displayJobs],
  )

  const exportVisibleJobsCsv = () => {
    const headers = [
      'Fit Score',
      'Role Track',
      'Title',
      'Company',
      'Salary',
      'Salary Band',
      'Culture Risk',
      'Source',
      'Date',
      'Link',
    ]

    const rows = displayJobs.map(job => [
      job.fit_score ?? '',
      job.role_track ?? inferRoleTrack(job.title),
      job.title ?? '',
      job.company ?? '',
      job.salary ?? '',
      job.salary_band ?? '',
      job.culture_risk ?? '',
      getSource(job).label,
      job.timestamp ?? '',
      job.link ?? '',
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'secure-engineering-roles.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const total = analytics?.totalActive || 0
  const pct = total > 0 ? Math.min(Math.round((jobs.length / total) * 100), 100) : 0
  const hasMore = analytics && jobs.length < total

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <div className="brand-block">
            <p className="brand-eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              Live · London, UK
            </p>
            <h1>
              Secure Engineering<span className="brand-accent"> Radar</span>
            </h1>
            <p className="brand-tagline">
              Ranked London roles for secure full-stack, AppSec, platform, DevEx and AI security work.
            </p>
          </div>

          {analytics && !loading && (
            <div className="header-stats" aria-label="Board statistics">
              <div className="stat-chip">
                <span className="stat-number">{analytics.totalActive}</span>
                <span className="stat-label">Active Roles</span>
              </div>
              <div className="stat-chip">
                <span className="stat-number">{analytics.timeframe ?? 'Last 14 Days'}</span>
                <span className="stat-label">Timeframe</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="app-shell">
        <aside className="sidebar" aria-label="Search and overview">
          <div className="panel">
            <p className="panel-label">Search &amp; Filter Roles</p>
            <form className="search-form" onSubmit={handleSearch}>
              <label className="sr-only" htmlFor="searchRoles">Search roles</label>
              <input
                id="searchRoles"
                type="search"
                className="search-input"
                placeholder="Python, AppSec, platform…"
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
                  onClick={() => {
                    setLoading(true)
                    setError(null)
                    setSearchInput('')
                    setCurrentQuery('')
                    setOffset(0)
                  }}
                >
                  Clear search
                </button>
              )}
            </form>

            <div className="quick-filters">
              {QUICK_FILTERS.map(filter => (
                <button
                  key={filter.label}
                  type="button"
                  className="btn-filter-tag"
                  onClick={() => handleQuickFilter(filter)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="filter-group">
              <label htmlFor="minFit" className="filter-label">Minimum fit score</label>
              <select id="minFit" className="filter-select" value={minFitScore} onChange={e => setMinFitScore(Number(e.target.value))}>
                <option value={0}>Any</option>
                <option value={45}>45+</option>
                <option value={60}>60+</option>
                <option value={75}>75+</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="roleTrack" className="filter-label">Role track</label>
              <select id="roleTrack" className="filter-select" value={roleTrackFilter} onChange={e => setRoleTrackFilter(e.target.value)}>
                {ROLE_TRACK_OPTIONS.map(option => <option key={option}>{option}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="salaryBand" className="filter-label">Salary band</label>
              <select id="salaryBand" className="filter-select" value={salaryBandFilter} onChange={e => setSalaryBandFilter(e.target.value)}>
                {SALARY_BAND_OPTIONS.map(option => <option key={option}>{option}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="culture" className="filter-label">Culture</label>
              <select id="culture" className="filter-select" value={cultureFilter} onChange={e => setCultureFilter(e.target.value)}>
                {CULTURE_OPTIONS.map(option => <option key={option}>{option}</option>)}
              </select>
            </div>

            <div className="filter-inline">
              <label>
                <input type="checkbox" checked={showSavedOnly} onChange={e => setShowSavedOnly(e.target.checked)} /> Show saved only
              </label>
              <button type="button" className="btn-clear" onClick={resetFilters}>Reset filters</button>
            </div>
          </div>

          {analytics && !loading && (
            <div className="panel" aria-label="Market overview">
              <p className="panel-label">Overview</p>
              <div className="analytics-badges">
                <div className="badge badge-default" role="status"><span className="badge-label">Active roles</span><strong>{analytics.totalActive}</strong></div>
                {analytics.avgPerm && analytics.avgPerm !== 'N/A' && <div className="badge badge-success" role="status"><span className="badge-label">Avg Perm</span><strong>{analytics.avgPerm}</strong></div>}
                {analytics.avgContract && analytics.avgContract !== 'N/A' && <div className="badge badge-warning" role="status"><span className="badge-label">Avg Contract</span><strong>{analytics.avgContract}</strong></div>}
                {analytics.topCompanies?.[0] && <div className="badge badge-alert" role="status"><span className="badge-label">Top hirer</span><strong>{analytics.topCompanies[0]}</strong></div>}

                <div className="badge badge-default"><span className="badge-label">Best fit</span><strong>{loadedAnalytics.bestFit ?? 'N/A'}</strong></div>
                <div className="badge badge-default"><span className="badge-label">Avg fit</span><strong>{loadedAnalytics.avgFit ?? 'N/A'}</strong></div>
                <div className="badge badge-success"><span className="badge-label">Apply-now roles</span><strong>{loadedAnalytics.applyNowCount}</strong></div>
                <div className="badge badge-success"><span className="badge-label">Core target salary</span><strong>{loadedAnalytics.coreSalaryCount}</strong></div>
                <div className="badge badge-alert"><span className="badge-label">High culture-risk</span><strong>{loadedAnalytics.highRiskCount}</strong></div>
                <div className="badge badge-default"><span className="badge-label">Saved roles</span><strong>{savedJobIds.length}</strong></div>
              </div>

              {jobs.length > 0 && (
                <>
                  <div className="panel-divider" />
                  <div className="meta-row"><span>Loaded</span><strong>{jobs.length} / {total}</strong></div>
                  {currentQuery && <div className="meta-row"><span>Query</span><strong>“{currentQuery}”</strong></div>}
                </>
              )}
            </div>
          )}
        </aside>

        <main aria-label="Job listings">
          {error && (
            <div className="error-banner" role="alert">
              {error}
            </div>
          )}

          <div className="listings-toolbar">
            <p className="listings-count">
              {loading
                ? 'Loading…'
                : <>Showing <strong>{displayJobs.length}</strong> of {jobs.length} loaded roles</>}
            </p>
            <div className="toolbar-actions">
              <label htmlFor="sortMode" className="filter-label">Sort by</label>
              <select id="sortMode" className="filter-select" value={sortMode} onChange={e => setSortMode(e.target.value)}>
                <option value="fit_desc">Fit score: high to low</option>
                <option value="newest">Newest first</option>
                <option value="salary_desc">Salary: high to low</option>
                <option value="company_asc">Company A-Z</option>
              </select>
              <button type="button" className="btn-clear" onClick={exportVisibleJobsCsv}>Export visible roles</button>
            </div>
          </div>

          {topMatches.length > 0 && (
            <section className="top-matches" aria-label="Top matches">
              <h2>Top matches</h2>
              <div className="top-matches-grid">
                {topMatches.map(job => (
                  <a key={`top-${job.id}`} className="top-match-card" href={job.link} target="_blank" rel="noreferrer noopener">
                    <strong>{job.fit_score}/100</strong> · {job.title} · {job.company} · {job.salary || 'Salary unknown'}
                  </a>
                ))}
              </div>
            </section>
          )}

          {loading ? (
            <div className="state-view" aria-live="polite">
              <p className="state-label">Scanning networks…</p>
              <p className="state-sublabel">Pulling live roles from the pipeline</p>
            </div>
          ) : displayJobs.length === 0 ? (
            <div className="state-view" aria-live="polite">
              <p className="state-label">No matching roles found.</p>
              <p className="state-sublabel">Try lowering the fit score, clearing culture filters, or searching a broader term such as Python, Platform, AppSec or Security.</p>
            </div>
          ) : (
            <>
              <div className="jobs-grid">
                {displayJobs.map(job => {
                  const src = getSource(job)
                  const parsedTags = parseJsonList(job.tags_json)
                  const visibleTags = parsedTags.slice(0, 6)
                  const hiddenTagCount = Math.max(parsedTags.length - visibleTags.length, 0)
                  const scoreReasons = parseJsonList(job.score_reasons_json)
                  const roleTrack = job.role_track || inferRoleTrack(job.title)
                  const salaryBand = job.salary_band || 'Unknown'
                  const cultureRisk = job.culture_risk || 'Unknown'
                  const score = typeof job.fit_score === 'number' ? job.fit_score : null
                  const contractLabel = job.salary_type === 'daily' ? 'Contract day rate' : null

                  return (
                    <article key={job.id} className="job-card">
                      <header className="job-card-header">
                        <div>
                          <h2 className="job-title">{job.title}</h2>
                          <div className="job-meta-line">
                            <span className="job-company">{job.company || 'Company unknown'}</span>
                            <span>·</span>
                            <span>{job.location || 'Location unknown'}</span>
                          </div>
                        </div>
                        <span className={`source-tag ${src.cls}`} aria-label={`Source: ${src.label}`}>{src.label}</span>
                      </header>

                      <p className={`score-pill ${score !== null ? getScoreBand(score) : 'score-low'}`}>
                        {score !== null ? `${score}/100 · ${getScoreLabel(score)}` : 'Unscored'}
                      </p>

                      <div className="pill-row">
                        <span className="role-track-pill">{roleTrack}</span>
                        <span className="salary-band-pill">{salaryBand}</span>
                        <span className={`culture-risk-pill ${
                          cultureRisk.toLowerCase().includes('low')
                            ? 'culture-low'
                            : cultureRisk.toLowerCase().includes('check') || cultureRisk.toLowerCase().includes('possible')
                              ? 'culture-medium'
                              : cultureRisk.toLowerCase().includes('high')
                                ? 'culture-high'
                                : 'culture-unknown'
                        }`}>Culture: {cultureRisk}</span>
                      </div>

                      <div className="salary-block">
                        <p><strong>Salary:</strong> {job.salary || 'Unknown'}</p>
                        <p><strong>Band:</strong> {salaryBand}</p>
                        {contractLabel && <p>{contractLabel}</p>}
                      </div>

                      {visibleTags.length > 0 && (
                        <p className="tags-line">
                          {visibleTags.map(tag => <span key={`${job.id}-${tag}`} className="tag-chip">{tag}</span>)}
                          {hiddenTagCount > 0 && <span className="tag-chip">+{hiddenTagCount}</span>}
                        </p>
                      )}

                      {scoreReasons.length > 0 && (
                        <details className="score-details">
                          <summary>Why this score?</summary>
                          <ul>
                            {scoreReasons.map((reason, index) => <li key={`${job.id}-reason-${index}`}>{reason}</li>)}
                          </ul>
                        </details>
                      )}

                      <footer className="job-footer">
                        <time className="job-date" dateTime={job.timestamp || ''}>{fmtDate(job.timestamp)}</time>
                        <div className="job-actions">
                          <button
                            type="button"
                            className={`saved-button ${savedJobIds.includes(job.id) ? 'saved-button-active' : ''}`}
                            onClick={() => toggleSavedJob(job.id)}
                          >
                            {savedJobIds.includes(job.id) ? 'Saved' : 'Save'}
                          </button>

                          {savedJobIds.includes(job.id) && (
                            <select
                              className="status-select"
                              aria-label={`Application status for ${job.title}`}
                              value={jobStatuses[job.id] || 'Reviewing'}
                              onChange={e => updateJobStatus(job.id, e.target.value)}
                            >
                              {STATUS_OPTIONS.map(status => <option key={status}>{status}</option>)}
                            </select>
                          )}

                          <a href={job.link} target="_blank" rel="noreferrer noopener" className="apply-btn">Apply →</a>
                        </div>
                      </footer>
                    </article>
                  )
                })}
              </div>

              {hasMore && (
                <div className="load-more-wrapper">
                  <p className="load-more-meta">Showing {jobs.length} of {total} roles · {pct}% loaded</p>
                  <div className="load-more-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                    <div className="load-more-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <button
                    className="btn-load-more"
                    onClick={() => {
                      setLoadingMore(true)
                      setError(null)
                      setOffset(prev => prev + 50)
                    }}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading…' : 'Load next 50 roles'}
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
