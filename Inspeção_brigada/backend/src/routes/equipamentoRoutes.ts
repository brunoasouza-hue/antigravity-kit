import { Router } from 'express';
import {
  listEquipamentos,
  getEquipamentoByCodigo,
  createEquipamento,
  updateEquipamento,
  deleteEquipamento
} from '../controllers/equipamentoController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', listEquipamentos);
router.get('/codigo/:codigo', getEquipamentoByCodigo);

// Criação, Edição e Remoção de Equipamentos exigem Admin
router.post('/', requireAdmin, createEquipamento);
router.put('/:id', requireAdmin, updateEquipamento);
router.delete('/:id', requireAdmin, deleteEquipamento);

export default router;
