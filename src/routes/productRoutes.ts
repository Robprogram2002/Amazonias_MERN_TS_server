import { Router } from 'express';
import { body, check } from 'express-validator';
import isAuth from '../middlewares/isAuth';
import isAdmin from '../middlewares/isAdmin';

import {
  create,
  deleteHandler,
  fetchOne,
  list,
  listByDepartment,
  update,
  filterByText,
} from '../controllers/categoryController';

const router = Router();

const productValidator = [
  body('title')
    .notEmpty()
    .isString()
    .trim()
    .escape()
    .isLength({ min: 4, max: 70 })
    .withMessage(
      'title must be at least 4 characters long and at most 70 characters long'
    ),
  body('type').isString().notEmpty().isIn(['simple', 'variants', 'intengible']),
  body('basePrice').notEmpty().isFloat({ gt: 0, min: 0 }),
  body('currency').notEmpty().isString().isIn(['USD', 'MXN', 'EUR']),
  body('description').notEmpty().isString(),
  body('sku').notEmpty().isString().trim(),
  body('stock').notEmpty().isInt({ min: 0, gt: -1 }),
  body('features').notEmpty().isArray({}),
  body('catgeoryId').notEmpty().isString(),
  body('subs').notEmpty().isArray({ min: 1 }),
  body('details').notEmpty().isString(),
  body('brand').notEmpty().isString(),
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

router.get('/list', list);
router.get('/list/:slug', fetchOne);
router.get('/list/by-category/:categoryId', listByDepartment);
router.get('/filter/by-text', filterByText);
router.post('/create', isAuth, isAdmin, productValidator, create);
router.patch('/update/:slug', isAuth, isAdmin, productValidator, update);
router.delete('/delete/:id', isAuth, isAdmin, deleteHandler);

export default router;
