import { Router } from 'express';
import { body } from 'express-validator';
import isAuth from '../middlewares/isAuth';
import isAdmin from '../middlewares/isAdmin';

import {
  create,
  deleteHandler,
  fetchOne,
  list,
  listByCategory,
  update,
  filterByText,
} from '../controllers/subCategoryController';

const router = Router();

const subCategoryValidator = [
  body('name')
    .isString()
    .not()
    .isEmpty()
    .trim()
    .isLength({ min: 3, max: 70 })
    .withMessage('name must be at least 3 characters long'),
  body('categoryId').isString().not().isEmpty(),
];

router.get('/list', list);
router.get('/list/:slug', fetchOne);
router.get('/list/by-category/:categoryId', listByCategory);
router.get('/filter/by-text', filterByText);
router.post('/create', isAuth, isAdmin, subCategoryValidator, create);
router.patch('/update/:slug', isAuth, isAdmin, subCategoryValidator, update);
router.delete('/delete/:id', isAuth, isAdmin, deleteHandler);

export default router;
