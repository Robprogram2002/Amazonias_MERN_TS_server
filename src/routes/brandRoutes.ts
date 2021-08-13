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
  fetchFeaturedBrands,
} from '../controllers/brandController';

const brandValidator = [
  body('name')
    .isString()
    .not()
    .isEmpty()
    .trim()
    .isLength({ min: 3, max: 70 })
    .withMessage('name must be at least 3 characters long'),
  check('logo.url').isString().notEmpty(),
  check('logo.publicId').isString().notEmpty(),
];

const router = Router();

router.get('/list', list);
router.get('/list/:slug', fetchOne);
router.get('/filter/by-text', filterByText);
router.get('/featured', fetchFeaturedBrands);
router.post('/create', isAuth, isAdmin, brandValidator, create);
router.patch('/update/:slug', isAuth, isAdmin, brandValidator, update);
router.delete('/delete/:id', isAuth, isAdmin, deleteHandler);

export default router;
