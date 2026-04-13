# 🇬🇧 DevSecOps Market Intelligence Engine
**Live Dashboard:** [https://my-job-board.pages.dev/](https://my-job-board.pages.dev/)

A stateful, fully automated CI/CD data pipeline and edge-compute application that aggregates and serves live cybersecurity roles in London. 

More than just a job board, this is a real-time statistical analysis tool designed to track market rates, separate contract vs. permanent salaries, and identify top hiring companies in the DevSecOps space.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Cloudflare D1](https://img.shields.io/badge/Cloudflare_D1-003B57?style=for-the-badge&logo=cloudflare&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

---

## 🏗️ The Architecture: End-to-End Pipeline

This application operates entirely on serverless and edge technologies, ensuring zero maintenance overhead, high availability, and sub-100ms response times.

1. **📥 Ingest (GitHub Actions + Python):** A daily CRON job triggers a Python scraper that pulls hundreds of fresh roles from the Adzuna and Reed APIs.
2. **🧹 Process & Store (Cloudflare D1):** The pipeline cleans the data, drops duplicates, and commits fresh leads to a Cloudflare D1 (SQLite) database sitting at the edge.
3. **🔔 Alert (Discord VIP Digest):** A Webhook integration curates the top 10 newest roles and sends a "Daily Digest" ping to a private Discord channel, preventing notification spam.
4. **📊 Analyze (Cloudflare Workers API):** A custom Edge API queries the database in batches, calculating on-the-fly market averages by separating daily contract rates from permanent annual salaries.
5. **🎨 Experience (React + Vite):** A highly accessible frontend consumes the API, offering real-time search, intelligent pagination, and market overviews.

---

## ✨ Key Features

### Advanced Market Analytics (The Math Engine)
Raw job board data is notoriously messy. The Cloudflare Worker API features a custom regex engine that parses unstructured salary strings (e.g., `"£100000.0 - £140000.0"` or `"£400 - £600"`) and categorizes them.
* **Avg Perm:** Accurately calculates the true annual salary average by filtering out daily rate anomalies and parsing complex decimal structures.
* **Avg Contract:** Isolates daily rates (values under £2,000) to provide an accurate reflection of the contractor market.
* **Top Hirer:** Dynamically aggregates the company currently posting the highest volume of roles in the 14-day window.

### "Trust & Clarity" UI (Accessibility First)
The frontend is designed with specific neurodivergent accessibility standards in mind (ADHD, ASD, and Dyslexia):
* **Visual Chunking:** Information is clearly separated into digestible cards with distinct visual hierarchies.
* **Low-Glare Palette:** Uses a soft slate off-white (`#F8FAFC`) background to reduce eye strain compared to pure white interfaces.
* **Semantic Tags:** Instantly identifiable color-coded tags route users to the source of the job (Adzuna vs. Reed).

### Smart Edge Pagination
To prevent browser lag and maintain instant load times, the API limits initial payloads to 50 jobs. Users can dynamically append the next 50 jobs to the grid via an `offset` parameter, complete with a visual progress tracking bar showing the percentage of the database loaded.

---

## 💻 Tech Stack Breakdown

* **Frontend:** React.js, Vite, Vanilla CSS (Custom Design System)
* **Backend API:** Cloudflare Workers (JavaScript)
* **Database:** Cloudflare D1 (Serverless SQLite)
* **Data Scraper:** Python 3 (Requests, SQLite3)
* **CI/CD & Automation:** GitHub Actions
* **Hosting:** Cloudflare Pages

---

## 🚀 Local Development Setup

To run the frontend locally:

```bash
# Clone the repository
git clone [https://github.com/SMCallan/my-job-board.git](https://github.com/SMCallan/my-job-board.git)

# Navigate into the project directory
cd my-job-board

# Install dependencies
npm install

# Start the Vite development server
npm run dev
