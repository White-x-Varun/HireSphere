# HireSphere - Smart AI-Powered Recruitment Platform

HireSphere is a state-of-the-art recruitment platform designed to streamline the hiring process using Artificial Intelligence. Built with a modern MERN stack, it offers an intuitive experience for both recruiters and job seekers.

## 🚀 Key Features

- **AI Resume Analysis**: Automated extraction of skills, experience, and education from PDF/Word resumes using Google's Generative AI.
- **Smart Job Matching**: intelligent matching of candidates to job descriptions.
- **ATS Scoring**: Get instant feedback on how well your resume fits a job role.
- **Interactive Dashboard**: Real-time updates and analytics for recruiters.
- **Dynamic Job Board**: Localization for the Indian market with INR (LPA) formatting.
- **Modern UI/UX**: A premium, responsive design built for speed and clarity.

## 🛠 Tech Stack

- **Frontend**: React, Vite, Vanilla CSS (Modern Design System)
- **Backend**: Node.js, Express 5
- **Database**: MongoDB (Mongoose)
- **AI Integration**: Google Gemini AI
- **Monorepo Management**: pnpm Workspaces
- **Real-time**: Socket.io

## 📦 Project Structure

```text
Job-Sphere-Dynamics/
├── backend/            # Express server and API logic
├── frontend/           # React client application
├── shared/             # Shared types, Zod schemas, and API specs
├── scripts/            # Database seeding and testing scripts
└── package.json        # Workspace configuration
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v20+)
- pnpm
- MongoDB instance

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/White-x-Varun/HireSphere.git
   cd HireSphere
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root based on `.env.example`.

4. Run the development server:
   ```bash
   pnpm dev
   ```

## 📜 License

This project is licensed under the MIT License.

---
Built with ❤️ by the HireSphere Team
