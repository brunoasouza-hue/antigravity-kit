import { Router } from 'express';
import { exportPDF, exportExcel, generateQRCodeDataURL } from '../controllers/reportController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/pdf', exportPDF);
router.get('/excel', exportExcel);
router.get('/qrcode/:code', generateQRCodeDataURL);

export default router;
