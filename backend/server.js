require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

// Routes
app.use('/api/autenticacao', require('./src/routes/autenticacao'));
app.use('/api/sessoes', require('./src/routes/sessoes'));
app.use('/api/usuarios', require('./src/routes/usuarios'));
app.use('/api/analises', require('./src/routes/analises'));
app.use('/api/refeicoes', require('./src/routes/refeicoes'));

// 404 handler
app.use((req, res) => res.status(404).json({ error: `Route ${req.path} not found` }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 SweatTrack API running on http://localhost:${PORT}`));
