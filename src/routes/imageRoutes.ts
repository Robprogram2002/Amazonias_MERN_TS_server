import { Router } from 'express';

// middlewares
import isAdmin from '../middlewares/isAdmin';
import isAuth from '../middlewares/isAuth';

// controllers
import { upload, remove } from '../controllers/imageController';

const router = Router();

// router.post('/upload', isAuth, isAdmin, upload);
router.post('/upload', upload);
router.delete('/remove/:publicId', isAuth, isAdmin, remove);

export default router;
