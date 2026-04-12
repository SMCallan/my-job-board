import { useEffect, useState } from 'react'
import './App.css' // Imports our new styling

function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  
  // YOUR WORKER URL
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
    <main className="dashboard-container">
      <header className="dashboard-header">
        <h1>🇬🇧 DevSecOps Job Radar</h1>
        <p>Live aggregation of Python and Security roles in London.</p>
      </header>
      
      {loading ? (
        <div className="loader">Scanning networks for jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="loader">No jobs found in the database.</div>
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
