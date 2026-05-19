# CareerPilot

CareerPilot is an intelligent, automated resume builder and job application tracking platform. It's built with React, Vite, and Node.js. It features a file system sync engine that manages your resume database locally and a web-based interface for managing tailored job applications.

## How it Works

CareerPilot features a frontend built with Vite and React, running alongside a local Node.js backend. The backend manages saving and reading job applications from the local file system in a JSON format database, enabling you to build, sync, and compile LaTeX tailored resumes (saved automatically inside the `data/tailored_resumes/` folder).

## How to Run Locally

You can launch the full-stack application with a single command. 

### Prerequisites

* Node.js installed on your machine
* `npm` package manager

### Installation

1. Navigate to the project directory:
   ```bash
   cd CareerPilot
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```

### Launching the Application

**Windows:**
You can double-click the `run.bat` file in the project's root folder. This will automatically boot up the server and frontend in a terminal window.

**Mac/Linux/Windows (Terminal):**
Run the following command from the root directory:
```bash
npm run dev
```

### What happens when you run it?
- The backend sync engine starts on port `3001`.
- The Vite frontend dev server starts on port `5173`.
- Your default web browser will automatically open to `http://localhost:5173/` after a brief delay.
