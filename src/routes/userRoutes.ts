import { Router } from 'express';
import isAuth from '../middlewares/isAuth';

import {
  addProductHandler,
  editProdutcQuantity,
  getCompleteCart,
  removeProductHandler,
  createCheckOutSession,
  createPaymentIntent,
} from '../controllers/cartController';

import { addUserShippingAddress } from '../controllers/userController';

const router = Router();

router.get('/cart/fetch-cart', isAuth, getCompleteCart);
router.post('/cart/add-product', isAuth, addProductHandler);
router.patch('/cart/remove-product', isAuth, removeProductHandler);
router.patch('/cart/edit-quantity', isAuth, editProdutcQuantity);

router.post('/address', isAuth, addUserShippingAddress);
router.post('/checkout/create-session', createCheckOutSession);
router.post('/checkout/create-payment', createPaymentIntent);

export default router;
