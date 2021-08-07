import { Router } from 'express';
import { body, check } from 'express-validator';
import isAuth from '../middlewares/isAuth';
import isAdmin from '../middlewares/isAdmin';

import {
  create,
  deleteHandler,
  fetchOne,
  list,
  listByCategory,
  update,
  adminFilter,
} from '../controllers/productController';

const router = Router();

const baseValidator = [
  body('title')
    .notEmpty()
    .isString()
    .trim()
    .escape()
    .isLength({ min: 4, max: 70 })
    .withMessage(
      'title must be at least 4 characters long and at most 70 characters long'
    ),
  body('type').isString().notEmpty().isIn(['simple', 'variant', 'intengible']),
  body('description').notEmpty(),
  body('features').notEmpty().isArray(),
  body('departmentId').notEmpty().isString(),
  body('categoryId').notEmpty().isString(),
  body('subs').notEmpty().isArray({ min: 1 }),
  body('details').notEmpty().isString(),
  body('brand').notEmpty().isString(),
];

const productValidator = [
  ...baseValidator,
  body('basePrice').notEmpty().isFloat({ gt: 0, min: 0 }),
  body('currency').notEmpty().isString().isIn(['USD', 'MXN', 'EUR']),
  body('sku').notEmpty().isString().trim(),
  body('stock').notEmpty().isInt({ min: 0, gt: -1 }),
  body('condition').notEmpty().isString(),
  body('state').notEmpty().isString(),
  body('availability').notEmpty().isString(),
  check('images.*.url')
    .notEmpty()
    .isString()
    .withMessage('each banner must have an url field'),
  check('images.*.publicId')
    .notEmpty()
    .isString()
    .withMessage('each banner must have an publicId field'),
];

const productVariantValidator = [
  ...baseValidator,
  body('variants').notEmpty(),
  // check('variants.name')
  //   .notEmpty()
  //   .isString()
  //   .withMessage('each variant must have a name'),
  // check('variants.options').notEmpty(),
  body('productVariants').notEmpty(),
];

router.get('/list', list);
router.get('/list/:slug', fetchOne);
router.post('/admin/filter', isAuth, isAdmin, adminFilter);
router.get('/list/by-category/:categoryId', listByCategory);
router.post('/create', isAuth, isAdmin, productValidator, create);
router.post(
  '/create-variants',
  isAuth,
  isAdmin,
  productVariantValidator,
  create
);
router.patch('/update/:slug', isAuth, isAdmin, productValidator, update);
router.delete('/delete/:id', isAuth, isAdmin, deleteHandler);

export default router;
