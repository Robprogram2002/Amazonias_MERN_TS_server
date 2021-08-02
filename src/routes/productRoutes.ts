import { Router } from 'express';
import { body } from 'express-validator';
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

const productValidator = [body('title').isString().trim()];

router.get('/list', list);
router.get('/list/:slug', fetchOne);
router.get('/list/by-category/:categoryId', listByDepartment);
router.get('/filter/by-text', filterByText);
router.post('/create', isAuth, isAdmin, productValidator, create);
router.patch('/update/:slug', isAuth, isAdmin, productValidator, update);
router.delete('/delete/:id', isAuth, isAdmin, deleteHandler);

export default router;
