import { Router } from 'express';
import { listUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas de gerenciamento de usuários exigem autenticação de Administrador
router.use(authenticateToken, requireAdmin);

router.get('/', listUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
