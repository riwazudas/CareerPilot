import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');
const TAILORED_RESUMES_DIR = path.join(DATA_DIR, 'tailored_resumes');

// Ensure data folder and tailored resumes subfolder exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(TAILORED_RESUMES_DIR)) {
  fs.mkdirSync(TAILORED_RESUMES_DIR, { recursive: true });
}

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET /api/data - Retrieve database contents
  if (req.url === '/api/data' && req.method === 'GET') {
    try {
      let dbData = {};
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        try {
          dbData = JSON.parse(fileContent);
        } catch (e) {
          dbData = {};
        }
      }

      // Sync read-only master resume reference from resume.md
      const resumeMdPath = path.join(__dirname, 'resume.md');
      if (fs.existsSync(resumeMdPath)) {
        dbData.resumeText = fs.readFileSync(resumeMdPath, 'utf8');
      }

      // Sync read-only baseline LaTeX resume from overleaf_resume.md
      const overleafResumePath = path.join(__dirname, 'overleaf_resume.md');
      if (fs.existsSync(overleafResumePath)) {
        dbData.overleafResumeText = fs.readFileSync(overleafResumePath, 'utf8');
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(dbData));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to read data: ' + err.message }));
    }
    return;
  }

  // POST /api/data - Write database contents and export job-specific tailored resumes
  if (req.url === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const parsedPayload = JSON.parse(body);
        
        // Write database config to db.json
        fs.writeFileSync(DATA_FILE, body, 'utf8');

        // Automatically export job-specific tailored resumes to disk
        if (Array.isArray(parsedPayload.jobs)) {
          parsedPayload.jobs.forEach(job => {
            if (job.tailoredResume && 
                job.tailoredResume.length > 100 && 
                !job.tailoredResume.includes('*(Run the Resume Lab optimizer')) {
              
              const sanitize = name => name.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').trim();
              const filename = `Tailored_Resume_${sanitize(job.role)}_${sanitize(job.company)}.tex`;
              const tailoredPath = path.join(TAILORED_RESUMES_DIR, filename);
              
              fs.writeFileSync(tailoredPath, job.tailoredResume, 'utf8');
            }
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON or write failed: ' + err.message }));
      }
    });
    return;
  }

  // POST /api/compile-latex - Compiles raw LaTeX using the public compiler API
  if (req.url === '/api/compile-latex' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { latexCode } = JSON.parse(body);
        if (!latexCode) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing latexCode' }));
          return;
        }

        // Call the compiler API
        const compilerUrl = 'https://latex.ytotech.com/builds/sync';
        const response = await fetch(compilerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            compiler: 'pdflatex',
            resources: [
              {
                main: true,
                content: latexCode
              }
            ]
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error('LaTeX compiler failed: ' + errText);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Length': buffer.length,
          'Content-Disposition': 'inline; filename="resume.pdf"'
        });
        res.end(buffer);
      } catch (err) {
        console.error('LaTeX compilation error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 404 Fallback
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`\x1b[35m[CareerPilot Server]\x1b[0m File system sync engine running at http://localhost:${PORT}/`);
  console.log(`\x1b[35m[CareerPilot Server]\x1b[0m Active database file: ${DATA_FILE}`);
});
