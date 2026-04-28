# 🇬🇧 DevSecOps Market Intelligence Engine — Frontend Dashboard

**Live Dashboard:** [https://my-job-board.pages.dev/](https://my-job-board.pages.dev/)

A React + Vite frontend for a live DevSecOps market intelligence dashboard tracking cybersecurity, secure engineering, AppSec, platform, DevEx, cloud security, and AI security roles across London.

This repository contains the **frontend application layer**: the user-facing dashboard that consumes an edge API, displays ranked job opportunities, and turns raw market data into a searchable, filterable, accessible interface.

The wider system includes a separate automated ingestion pipeline that collects roles from external job APIs, normalises the data, stores it in Cloudflare D1, and serves it through a Cloudflare Worker API.

---

## 🧭 What This Dashboard Does

This is more than a simple job board UI.

The frontend is designed as a lightweight market intelligence interface for analysing the London DevSecOps and secure engineering market. It helps answer practical questions such as:

- Which roles are currently live?
- Which roles best match a secure full-stack / AppSec / platform engineering profile?
- Which jobs have strong salary alignment?
- Which roles may carry higher culture or on-call risk?
- Which companies are hiring most actively?
- Which roles should be saved, reviewed, applied to, or archived?

The dashboard consumes live role data from a Cloudflare Worker API and presents it through a fast, accessible, low-friction React interface.

---

## 🖥️ Frontend Preview

**Production:** [https://my-job-board.pages.dev/](https://my-job-board.pages.dev/)

Core interface sections:

- **Header overview** showing active roles and reporting timeframe
- **Search and quick filters** for role types, technologies, salary, and culture indicators
- **Market overview cards** for active roles, salary analytics, fit scores, saved roles, and risk signals
- **Top matches section** highlighting the strongest current opportunities
- **Job cards** with fit score, company, salary, source, tags, scoring reasons, saved status, and apply link
- **Progressive loading** with “Load next 50 roles” pagination
- **CSV export** for visible filtered results

---

## 🧱 System Architecture

This frontend is one part of a serverless, edge-first market intelligence system.

```text
External Job APIs
      ↓
Python ingestion engine
      ↓
Cloudflare D1 database
      ↓
Cloudflare Worker API
      ↓
React + Vite dashboard
      ↓
Cloudflare Pages deployment
````

### 1. Data Ingestion

A separate backend ingestion engine collects live cybersecurity and secure engineering roles from job APIs such as Adzuna and Reed.

The ingestion layer is responsible for:

* Fetching fresh role data
* Normalising inconsistent job board payloads
* Removing duplicates
* Extracting salary information
* Writing structured records to Cloudflare D1
* Triggering automated updates through GitHub Actions

### 2. Edge API

The frontend consumes a Cloudflare Worker API:

```js
https://job-board-api.callansmithmacdonald.workers.dev
```

The API returns:

* Job listings
* Market analytics
* Salary summaries
* Source metadata
* Pagination metadata
* Fit score and role classification fields where available

### 3. React Dashboard

The frontend transforms the API response into an interactive dashboard with:

* Search
* Filtering
* Sorting
* Saving
* Application status tracking
* CSV export
* Progressive loading
* Accessibility-first layout

---

## ✨ Key Features

### 🔎 Live Search

Users can search across live roles using keywords such as:

* `Python`
* `AppSec`
* `Platform`
* `Cloud Security`
* `AI Security`
* `DevSecOps`
* `TypeScript`
* `Docker`
* `CI/CD`

Search queries are sent to the API and reset pagination cleanly so results stay fast and relevant.

---

### ⚡ Quick Filters

The sidebar includes one-click filters for common target areas:

* Secure Full Stack
* Application Security
* Product Security
* Platform Engineering
* Developer Experience
* Python
* TypeScript
* Docker
* CI/CD
* Cloud Security
* AI Security
* Low On-Call
* £60k+

These filters are designed for fast, practical job-market triage rather than generic browsing.

---

### 🎯 Fit Score Ranking

Roles can be ranked by fit score, helping prioritise opportunities that best match the target profile.

Score bands are presented with clear labels:

| Score Range | Label           |
| ----------- | --------------- |
| 75+         | Apply now       |
| 60–74       | Worth reviewing |
| 45–59       | Check carefully |
| Below 45    | Low fit         |

This allows the dashboard to function as a decision-support tool rather than a passive listings page.

---

### 🧩 Role Track Classification

The dashboard groups roles into practical career tracks, including:

* Secure Full-Stack
* Application Security
* Product Security
* Platform
* DevEx
* Cloud Security
* DevSecOps
* SRE
* AI Security
* Trust & Safety

Where a role track is not provided by the backend, the frontend can infer a basic track from the job title.

---

### 💷 Salary and Contract Intelligence

The frontend displays salary data alongside backend-derived salary bands.

Supported views include:

* Salary text from the source listing
* Salary band classification
* Permanent salary indicators
* Contract day-rate indicators
* Minimum salary filtering
* Salary-based sorting

This helps separate high-value opportunities from noisy job-board data.

---

### 🧠 Culture and Risk Signals

The dashboard includes culture-risk filtering and display labels such as:

* Low culture risk
* Check on-call
* Possible chaos
* High pressure
* Unknown

This reflects a more realistic job search workflow where compensation alone is not enough. Roles can be reviewed based on likely operational pressure, on-call expectations, ambiguity, or delivery risk.

---

### ⭐ Saved Roles and Application Status

Users can save roles locally in the browser.

Saved roles can then be assigned a lightweight application status:

* Reviewing
* Applied
* Interview
* Rejected
* Archived

This state is stored in `localStorage`, so the dashboard works as a simple personal job-tracking tool without requiring authentication or a backend user account.

---

### 📤 CSV Export

Visible filtered roles can be exported as a CSV file.

The export includes:

* Fit score
* Role track
* Job title
* Company
* Salary
* Salary band
* Culture risk
* Source
* Date
* Application link

This makes it easy to use the dashboard data in spreadsheets, notes, personal tracking systems, or further analysis workflows.

---

### 📊 Market Overview

The sidebar includes high-level market indicators such as:

* Total active roles
* Average permanent salary
* Average contract rate
* Top hiring company
* Best fit score
* Average fit score
* Number of apply-now roles
* Number of saved roles
* Number of high culture-risk roles

These cards turn the dashboard into a compact market snapshot rather than just a list of jobs.

---

### 📈 Smart Pagination

The frontend loads jobs progressively rather than requesting the entire dataset at once.

The dashboard initially loads a batch of roles, then allows the user to append more results using:

```text
Load next 50 roles
```

A progress bar shows how much of the available dataset has been loaded.

This keeps the interface responsive even as the database grows.

---

## ♿ Accessibility and UX Principles

The interface is designed around clarity, readability, and reduced cognitive load.

Key UX principles:

* Clear card-based visual hierarchy
* Low-glare background palette
* Large readable sections
* Semantic HTML structure
* Keyboard-friendly form controls
* Explicit labels for filters and status controls
* Simple language for score bands and role metadata
* Avoidance of dense, spreadsheet-like layouts

The goal is to support fast scanning while still preserving enough detail for careful decision-making.

---

## 🛠️ Tech Stack

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge\&logo=react\&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge\&logo=javascript\&logoColor=F7DF1E)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge\&logo=css3\&logoColor=white)

* React
* Vite
* JavaScript
* Vanilla CSS
* Browser `localStorage`
* Fetch API

### Edge / Platform

![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?style=for-the-badge\&logo=cloudflare\&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge\&logo=cloudflare\&logoColor=white)
![Cloudflare D1](https://img.shields.io/badge/Cloudflare_D1-003B57?style=for-the-badge\&logo=cloudflare\&logoColor=white)

* Cloudflare Pages for frontend hosting
* Cloudflare Workers for the API layer
* Cloudflare D1 for serverless SQLite storage

### Wider Pipeline

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge\&logo=python\&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge\&logo=github-actions\&logoColor=white)

* Python ingestion engine
* GitHub Actions automation
* External job APIs
* Discord webhook digesting

---

## 📁 Project Structure

Typical frontend structure:

```text
my-job-board/
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── assets/
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

The primary dashboard logic currently lives in:

```text
src/App.jsx
```

The main visual system is defined in:

```text
src/App.css
```

---

## 🚀 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/SMCallan/my-job-board.git
cd my-job-board
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Vite will start a local development server and print the local URL in the terminal.

---

## 🧪 Available Scripts

### Start local development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build locally

```bash
npm run preview
```

### Run linting

```bash
npm run lint
```

---

## 🔌 API Configuration

The frontend currently consumes the production Cloudflare Worker API directly:

```js
const API_URL = 'https://job-board-api.callansmithmacdonald.workers.dev'
```

This is defined in:

```text
src/App.jsx
```

For future development, this could be moved into a Vite environment variable, for example:

```env
VITE_API_URL=https://job-board-api.callansmithmacdonald.workers.dev
```

Then consumed with:

```js
const API_URL = import.meta.env.VITE_API_URL
```

This would make it easier to switch between local, staging, and production API environments.

---

## 🧾 Data Model Expectations

The dashboard expects job objects with fields such as:

```js
{
  id: string,
  title: string,
  company: string,
  location: string,
  salary: string,
  salary_min: number,
  salary_max: number,
  salary_type: string,
  salary_band: string,
  culture_risk: string,
  role_track: string,
  fit_score: number,
  score_reasons_json: string,
  tags_json: string,
  source: string,
  timestamp: string,
  link: string
}
```

The API also returns an `analytics` object used to populate the overview panel:

```js
{
  totalActive: number,
  timeframe: string,
  avgPerm: string,
  avgContract: string,
  topCompanies: string[]
}
```

---

## 🧠 Design Philosophy

This project is designed as a practical example of how software engineering, automation, and security-oriented market analysis can be combined into a useful personal intelligence system.

It demonstrates:

* Full-stack system thinking
* Edge-first application design
* CI/CD automation
* Real-time data ingestion
* API-driven frontend architecture
* Accessibility-conscious UI design
* Lightweight personal workflow tooling
* Secure engineering and DevSecOps market awareness

The dashboard is deliberately built to be simple, fast, and inspectable rather than over-engineered.

---

## 🔮 Future Improvements

Potential next steps:

* Move API URL into environment configuration
* Add frontend tests with Vitest or Playwright
* Add richer loading skeletons
* Add saved-role export/import
* Add company-level drilldowns
* Add charts for salary trends and role categories
* Add date-range filtering
* Add remote/hybrid/on-site filtering
* Add source-specific filtering
* Add better mobile-first refinements
* Add dark mode
* Add authenticated personal dashboards
* Add deployment status badge
* Add screenshots or GIF demo to this README

---

## 🧑‍💻 Author

Built by [Callan Smith MacDonald](https://github.com/SMCallan)

Full-Stack Software Engineer & Security Researcher focused on secure systems, automation, DevSecOps, and AI/LLM evaluation.

---

## 📄 Licence

Who gives a toss?
