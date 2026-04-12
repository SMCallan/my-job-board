import { useEffect, useState } from 'react'

function App() {
  const [jobs, setJobs] = useState([])
  
  // PASTE YOUR WORKER URL HERE
  const API_URL = "https://job-board-api.YOUR_USERNAME.workers.dev"

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(err => console.error("Failed to fetch jobs:", err))
  }, [])

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui', padding: '20px' }}>
      <h1>🇬🇧 My DevSecOps Job Board</h1>
      
      {jobs.length === 0 ? <p>Loading jobs...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {jobs.map(job => (
            <div key={job.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{job.title}</h2>
              <p style={{ margin: '5px 0' }}><strong>🏢 Company:</strong> {job.company}</p>
              <p style={{ margin: '5px 0' }}><strong>💰 Salary:</strong> {job.salary}</p>
              <p style={{ margin: '5px 0', fontSize: '0.8rem', color: '#666' }}>Added: {new Date(job.timestamp).toLocaleDateString()}</p>
              <a 
                href={job.link} 
                target="_blank" 
                rel="noreferrer"
                style={{ display: 'inline-block', marginTop: '10px', padding: '8px 16px', background: '#0070f3', color: 'white', textDecoration: 'none', borderRadius: '4px' }}
              >
                Apply Now
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App