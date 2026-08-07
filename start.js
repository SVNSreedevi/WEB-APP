const { spawn } = require('child_process');
const path = require('path');

// Run the server
const server = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['start'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// Run the client
const client = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

// Run the Python AI Service
const pythonExe = /^win/.test(process.platform) 
  ? path.join(__dirname, 'AI_Model', 'venv', 'Scripts', 'python.exe')
  : path.join(__dirname, 'AI_Model', 'venv', 'bin', 'python');

const aiService = spawn(pythonExe, ['ai_service.py'], {
  cwd: path.join(__dirname, 'AI_Model'),
  stdio: 'inherit',
  shell: true
});

// Handle termination
process.on('SIGINT', () => {
  server.kill('SIGINT');
  client.kill('SIGINT');
  aiService.kill('SIGINT');
  process.exit();
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
  client.kill('SIGTERM');
  aiService.kill('SIGTERM');
  process.exit();
});
