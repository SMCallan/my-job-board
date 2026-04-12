import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [jobs, setJobs] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Search state
  const [searchInput, setSearchInput] = useState('')
  const [currentQuery, setCurrentQuery] = useState('')
  
  const API_URL = "https://job-board-api.callansmithmacdonald.workers.dev"

  useEffect(() => {
    setLoading(true)
    
    // If a user searched for something, append it to the API URL
    const fetchUrl = currentQuery 
      ? `${API_URL}?search=${encodeURIComponent(currentQuery)}` 
      : API_URL

    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => {
        // We now extract the jobs and analytics separately based on our new API structure
        setJobs(data.jobs || [])
        setAnalytics(data.analytics || null)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch jobs:", err)
        setLoading(false)
      })
  }, [currentQuery]) // Re-runs this effect whenever a user submits a new search

  // Handle the search form submission
  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentQuery(searchInput)
  }

  // Clear search and reset the board
  const clearSearch = () => {
    setSearchInput('')
    setCurrentQuery('')
  }

  return (
    <main className="dashboard-container">
      <header className="dashboard-header">
        <h1>🇬🇧 DevSecOps Job Radar</h1>
        <p>Live aggregation of tech and security roles in London.</p>

        {/* --- THE NEW SEARCH BAR --- */}
        <form className="search-bar" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search roles, companies, or keywords (e.g., Python, AWS)..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search jobs"
          />
          <button type="submit" className="search-button">Search</button>
          {currentQuery && (
            <button type="button" onClick={clearSearch} className="clear-button">Clear</button>
          )}
        </form>

        {/* --- THE NEW ANALYTICS BADGE --- */}
        {analytics && !loading && (
          <div className="analytics-bar">
            <span className="analytic-badge">
              <strong>{analytics.totalActive}</strong> Active Roles ({analytics.timeframe})
            </span>
          </div>
        )}
      </header>
      
      {loading ? (
        <div className="loader">Scanning networks for jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="loader">No jobs found matching your criteria.</div>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => (
            <article key={job.id} className="job-card">
              <h2 className="job-title">{job.title}</h2>
              
              <div className="job-details">
                <p>🏢 <strong>{job.company}</strong></p>
                <p>💰 {job.salary}</p>
              </div>
              
              <div className="job-date">
                Added: {new Date(job.timestamp).toLocaleDateString('en-GB')}
              </div>
              
              <a 
                href={job.link} 
                target="_blank" 
                rel="noreferrer"
                className="apply-button"
                aria-label={`Apply for ${job.title} at ${job.company}`}
              >
                Apply Now
              </a>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export default App
