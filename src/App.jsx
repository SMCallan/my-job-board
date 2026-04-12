import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [jobs, setJobs] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false) // New state for pagination
  
  const [searchInput, setSearchInput] = useState('')
  const [currentQuery, setCurrentQuery] = useState('')
  const [offset, setOffset] = useState(0) // Tracks how many jobs we've loaded
  
  const API_URL = "https://job-board-api.callansmithmacdonald.workers.dev"

  useEffect(() => {
    if (offset === 0) setLoading(true)
    else setLoadingMore(true)

    const fetchUrl = currentQuery 
      ? `${API_URL}?search=${encodeURIComponent(currentQuery)}&offset=${offset}` 
      : `${API_URL}?offset=${offset}`

    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => {
        if (offset === 0) {
          setJobs(data.jobs || []) // Fresh search
        } else {
          setJobs(prev => [...prev, ...(data.jobs || [])]) // Append next 50 jobs
        }
        setAnalytics(data.analytics || null)
        setLoading(false)
        setLoadingMore(false)
      })
      .catch(err => {
        console.error("Failed to fetch jobs:", err)
        setLoading(false)
        setLoadingMore(false)
      })
  }, [currentQuery, offset])

  const handleSearch = (e) => {
    e.preventDefault()
    setOffset(0) // Reset to first page on new search
    setCurrentQuery(searchInput)
  }

  const clearSearch = () => {
    setSearchInput('')
    setCurrentQuery('')
    setOffset(0)
  }

  return (
    <main className="dashboard-container">
      <header className="dashboard-header">
        <h1>🇬🇧 DevSecOps Job Radar</h1>
        <p>Live aggregation of tech and security roles in London.</p>

        <div className="controls-container">
          <form className="search-bar" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Search roles, companies (e.g., Python, AWS)..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search jobs"
            />
            <button type="submit" className="btn-primary">Search</button>
            {currentQuery && (
              <button type="button" onClick={clearSearch} className="btn-secondary">Clear</button>
            )}
          </form>
        </div>

        {/* --- THE NEW ANALYTICS DASHBOARD --- */}
        {analytics && !loading && (
          <div className="analytics-dashboard">
            <div className="analytic-badge">
              <strong>{analytics.totalActive}</strong> Active Roles
            </div>
            
            {analytics.averageSalary && analytics.averageSalary !== "N/A" && (
              <div className="analytic-badge success-badge">
                Avg Market Rate: <strong>{analytics.averageSalary}</strong>
              </div>
            )}

            {analytics.topCompanies && analytics.topCompanies.length > 0 && (
              <div className="analytic-badge alert-badge">
                Top Hirer: <strong>{analytics.topCompanies[0]}</strong>
              </div>
            )}
          </div>
        )}
      </header>
      
      {loading ? (
        <div className="loader" aria-live="polite">Scanning networks for jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="loader" aria-live="polite">No jobs found matching your criteria.</div>
      ) : (
        <>
          <div className="results-count">
            Showing {jobs.length} of {analytics?.totalActive || 0} roles
          </div>

          <div className="jobs-grid">
            {jobs.map(job => {
              // Extract source from the ID prefix
              const isAdzuna = job.id.startsWith('adzuna');
              const sourceName = isAdzuna ? 'Adzuna' : 'Reed';
              const sourceClass = isAdzuna ? 'tag-adzuna' : 'tag-reed';

              return (
                <article key={job.id} className="job-card">
                  <div className="job-header-row">
                    <h2 className="job-title">{job.title}</h2>
                    <span className={`source-tag ${sourceClass}`}>{sourceName}</span>
                  </div>
                  
                  <ul className="job-meta-list">
                    <li>🏢 <strong>{job.company}</strong></li>
                    <li>💰 {job.salary}</li>
                  </ul>
                  
                  <div className="job-footer">
                    <span className="job-date">
                      Added: {new Date(job.timestamp).toLocaleDateString('en-GB')}
                    </span>
                    <a 
                      href={job.link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="apply-button"
                      aria-label={`Apply for ${job.title} at ${job.company}`}
                    >
                      Apply Now
                    </a>
                  </div>
                </article>
              )
            })}
          </div>

          {/* --- LOAD MORE BUTTON --- */}
          {analytics && jobs.length < analytics.totalActive && (
            <div className="load-more-container">
              <button 
                className="btn-secondary load-more-btn"
                onClick={() => setOffset(prev => prev + 50)}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load Next 50 Roles ↓'}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}

export default App
