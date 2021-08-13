import { Router } from 'express';
import { body, check } from 'express-validator';
import isAuth from '../middlewares/isAuth';
import isAdmin from '../middlewares/isAdmin';

import {
  create,
  deleteHandler,
  fetchOne,
  list,
  update,
  filterByText,
  fetchOneWithProducts,
  fetchFeaturedVendors,
} from '../controllers/vendorController';

const router = Router();

const vendorValidator = [
  body('name')
    .isString()
    .not()
    .isEmpty()
    .trim()
    .isLength({ min: 3, max: 70 })
    .withMessage('name must be at least 3 characters long'),
  body('description').notEmpty().isString(),
  check('image.url')
    .notEmpty()
    .isString()
    .withMessage('each banner must have an url field'),
  check('image.publicId')
    .notEmpty()
    .isString()
    .withMessage('each banner must have an publicId field'),
  check('location.country').notEmpty().isString(),
  check('location.address').notEmpty().isString(),
  check('location.postalCode').notEmpty().isString(),
  check('location.state').notEmpty().isString(),
  check('contact.person').notEmpty().isString(),
  check('contact.email').notEmpty().isString(),
  check('contact.phone').notEmpty().isString(),
];

router.get('/list', list);
router.get('/list/:slug', fetchOne);
router.get('/list/:slug/with-products', fetchOneWithProducts);
router.get('/filter/by-text', filterByText);
router.get('/featured', fetchFeaturedVendors);
router.post('/create', isAuth, isAdmin, vendorValidator, create);
router.patch('/update/:slug', isAuth, isAdmin, vendorValidator, update);
router.delete('/delete/:id', isAuth, isAdmin, deleteHandler);

export default router;
