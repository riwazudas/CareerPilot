import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\x1b[36m[CareerPilot Bootloader]\x1b[0m Starting full-stack local application...');
console.log('\x1b[36m[CareerPilot Bootloader]\x1b[0m Initializing sync backend (port 3001) and Vite frontend (port 5173)...');

// 1. Spawn backend database sync server
const backend = spawn('node', ['server.js'], {
  cwd: __dirname,
  shell: true,
  stdio: 'inherit'
});

// 2. Spawn frontend dev compiler (Vite)
const frontend = spawn('npx', ['vite'], {
  cwd: __dirname,
  shell: true,
  stdio: 'inherit'
});

// Graceful cleanup on terminal close
const handleExit = () => {
  console.log('\n\x1b[36m[CareerPilot Bootloader]\x1b[0m Terminating server connections...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit();
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
