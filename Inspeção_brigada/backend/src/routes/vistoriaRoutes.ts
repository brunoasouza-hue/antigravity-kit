import { Router } from 'express';
import { createVistoria, listVistorias } from '../controllers/vistoriaController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/', createVistoria);
router.get('/', listVistorias);

export default router;
