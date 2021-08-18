import { Router } from 'express';
import isAuth from '../middlewares/isAuth';

import {
  addProductHandler,
  editProdutcQuantity,
  removeProductHandler,
} from '../controllers/cartController';

const router = Router();

router.post('/add-product', isAuth, addProductHandler);
router.patch('/remove-product', isAuth, removeProductHandler);
router.patch('/edit-quantity', isAuth, editProdutcQuantity);

export default router;
