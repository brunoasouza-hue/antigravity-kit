import express from 'express';
import cors from 'cors';
import { initDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import equipamentoRoutes from './routes/equipamentoRoutes';
import vistoriaRoutes from './routes/vistoriaRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import reportRoutes from './routes/reportRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializar banco de dados SQLite e Seeds
initDatabase();

// Middlewares Globais
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API de Inspeção da Brigada operando normalmente.', timestamp: new Date() });
});

// Registro de Rotas API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/equipamentos', equipamentoRoutes);
app.use('/api/vistorias', vistoriaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor Backend da Brigada rodando na porta ${PORT} (http://localhost:${PORT})`);
});
