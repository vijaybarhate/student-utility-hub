# Student Utility Hub

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=cloudflare&logoColor=white)](https://student-utility-hub-e7l.pages.dev)
[![Repo Size](https://img.shields.io/github/repo-size/vijaybarhate/student-utility-hub?style=for-the-badge&color=blue)](https://github.com/vijaybarhate/student-utility-hub)
[![Astro Version](https://img.shields.io/badge/Built%20With-Astro%20v5-ff5d01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build)

A premium, distraction-free suite of academic calculators tailored specifically for Indian college students. It provides local-first, privacy-respecting tools to manage attendance, project GPA, verify ATKT eligibility, and calculate passing marks criteria.

![Student Utility Hub Banner](https://student-utility-hub-e7l.pages.dev/og-image.png)

---

## 🚀 Key Features

*   📅 **Attendance & Bunk Tracker**
    *   Input current attendance numbers and targets (e.g., 75%).
    *   Instantly calculate the exact number of upcoming lectures you can safely bunk or must attend to maintain your target.
*   🎓 **GPA (SGPA/CGPA) Calculator**
    *   Compute semester SGPA and overall CGPA using credit-weighted grades.
    *   Simulate grades required in remaining courses to achieve target CGPA goals.
*   🔄 **CGPA to Percentage Converter**
    *   Instant conversions using official multiplier formulas from SPPU, Mumbai University (MU), VTU, Anna University, and others.
*   🎯 **Pass Marks Calculator**
    *   Calculate the exact marks needed in semester-end theory exams based on internal assessment/term work scores and official passing criteria.
*   🛡️ **ATKT & Backlog Helper**
    *   Evaluate eligibility to keep terms (ATKT) and verify promotion regulations for Mumbai University and autonomous colleges to prevent year-downs.

---

## 🛠️ Tech Stack & Engineering Highlights

*   **Meta-Framework**: [Astro](https://astro.build/) - Selected for partial hydration (Astro Islands) and optimized static builds to deliver sub-second page loads.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Responsive design system with fluid layout scales and semantic styling.
*   **Database & Privacy**: **Local-First Storage** - Zero external trackers or databases. Attendance records and academic inputs are stored locally in the browser's `localStorage` for complete data privacy.
*   **Performance & SEO**:
    *   Fully optimized HTML5 semantic structure.
    *   Dynamic XML sitemap generation and Open Graph (OG) metadata.
    *   Structured JSON-LD schema integration for search engines.
    *   Progressive Web App (PWA) configuration with app manifest and service worker caching for offline access.
*   **Hosting & CI/CD**: [Cloudflare Pages](https://pages.cloudflare.com/) - Global edge network deployment with automated Git hooks.

---

## 📂 Project Structure

```text
/
├── public/                # Static assets, sitemaps, manifests, and favicons
├── src/
│   ├── assets/            # Project graphics and image assets
│   ├── components/        # Reusable UI elements (cards, headers, layouts)
│   ├── layouts/           # Base templates for page layouts
│   ├── styles/            # Tailwind theme extensions and custom stylesheet
│   └── pages/             # Route files (Astro file-system based routing)
├── astro.config.mjs       # Astro configurations and integration setup
├── package.json           # Project dependencies and scripting
└── tsconfig.json          # TypeScript configurations
```

---

## ⚡ Local Development Setup

To run the project locally, follow these steps:

1.  **Clone the Repository**
    ```sh
    git clone https://github.com/vijaybarhate/student-utility-hub.git
    cd student-utility-hub
    ```

2.  **Install Dependencies**
    ```sh
    npm install
    ```

3.  **Start Dev Server**
    ```sh
    npm run dev
    ```
    Open `http://localhost:4321` in your browser.

4.  **Build Production Site**
    ```sh
    npm run build
    ```

---

## 🗺️ Roadmap

- [ ] **Syllabus Progression Tracker**: Log completed and pending topics for upcoming assessments.
- [ ] **Exam Countdown Timer**: Visual timers tracking days remaining for practical and written exams.
- [ ] **Distraction-Free Study Planner**: Time-blocking tool using local Pomodoro intervals.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
