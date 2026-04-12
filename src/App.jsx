import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [jobs, setJobs] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [searchInput, setSearchInput] = useState('')
  const [currentQuery, setCurrentQuery] = useState('')
  
  const API_URL = "https://job-board-api.callansmithmacdonald.workers.dev"

  useEffect(() => {
    setLoading(true)
    const fetchUrl = currentQuery 
      ? `${API_URL}?search=${encodeURIComponent(currentQuery)}` 
      : API_URL

    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => {
        setJobs(data.jobs || [])
        setAnalytics(data.analytics || null)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch jobs:", err)
        setLoading(false)
      })
  }, [currentQuery])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentQuery(searchInput)
  }

  const clearSearch = () => {
    setSearchInput('')
    setCurrentQuery('')
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

          {analytics && !loading && (
            <div className="analytic-badge">
              {analytics.totalActive} Active Roles ({analytics.timeframe})
            </div>
          )}
        </div>
      </header>
      
      {loading ? (
        <div className="loader" aria-live="polite">Scanning networks for jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="loader" aria-live="polite">No jobs found matching your criteria.</div>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => (
            <article key={job.id} className="job-card">
              <h2 className="job-title">{job.title}</h2>
              
              {/* Semantic list for better screen reader accessibility */}
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
          ))}
        </div>
      )}
    </main>
  )
}

export default App
