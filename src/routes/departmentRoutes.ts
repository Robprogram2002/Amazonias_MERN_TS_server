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
  fetchMenuData,
  fetchMenuDataTwo,
} from '../controllers/departmentController';

const departValidator = [
  body('name')
    .isString()
    .not()
    .isEmpty()
    .trim()
    .isLength({ min: 3, max: 70 })
    .withMessage('name must be at least 3 characters long'),
  body('description')
    .isString()
    .trim()
    .notEmpty()
    .isLength({ min: 50 })
    .withMessage('description must be at least 50 characters long'),
  body('banners')
    .isArray({ min: 4, max: 4 })
    .withMessage('department must have 4 banner images'),
  check('banners.*.url')
    .isString()
    .notEmpty()
    .withMessage('each banner must have an url field'),
  check('banners.*.publicId')
    .isString()
    .notEmpty()
    .withMessage('each banner must have an publicId field'),
];

const router = Router();

router.get('/list', list);
router.get('/list/:slug', fetchOne);
router.get('/filter/by-text', filterByText);
router.get('/menu-data', fetchMenuData);
router.get('/menu-data-two', fetchMenuDataTwo);
router.post('/create', isAuth, isAdmin, departValidator, create);
router.patch('/update/:slug', isAuth, isAdmin, departValidator, update);
router.delete('/delete/:id', isAuth, isAdmin, deleteHandler);

export default router;
