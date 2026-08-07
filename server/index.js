require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { spawn } = require('child_process');
const path = require('path');

// Automatically spawn the Python AI Service
const pythonExe = process.env.NODE_ENV === 'production' 
  ? 'python3' 
  : /^win/.test(process.platform) 
    ? path.join(__dirname, '..', 'AI_Model', 'venv', 'Scripts', 'python.exe')
    : path.join(__dirname, '..', 'AI_Model', 'venv', 'bin', 'python');

const aiProcess = spawn(pythonExe, ['ai_service.py'], {
  cwd: path.join(__dirname, '..', 'AI_Model'),
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  if (aiProcess) aiProcess.kill();
};
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(); });
process.on('SIGTERM', () => { cleanup(); process.exit(); });
process.on('SIGUSR2', () => { cleanup(); process.exit(); });

const app = express();
connectDB();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/surgeries', require('./routes/surgeries'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/patient-notes', require('./routes/patientNotes'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: `Route ${req.path} not found` }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
