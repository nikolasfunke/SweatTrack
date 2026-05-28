require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(compression());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);


app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));


app.use('/api/auth',      require('./src/routes/auth'));
app.use('/api/sessions',  require('./src/routes/sessions'));
app.use('/api/users',     require('./src/routes/users'));
app.use('/api/analytics', require('./src/routes/analytics'));
app.use('/api/admin',     require('./src/routes/admin'));


app.use((req, res) => res.status(404).json({ error: `Route ${req.path} not found` }));


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 API da SweatTrack rodando em http://localhost:${PORT}`));
