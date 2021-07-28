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
} from '../controllers/categoryController';

const router = Router();

const categoryValidator = [
  body('name')
    .isString()
    .not()
    .isEmpty()
    .trim()
    .isLength({ min: 3, max: 70 })
    .withMessage('name must be at least 3 characters long'),
  body('banners')
    .isArray({ min: 4, max: 4 })
    .withMessage('department must have 4 banner images'),
  // .custom((value) => {
  //   if (!value.url || typeof value.url !== 'string') {
  //     throw new Error('banners must have an string url property');
  //   } else if (!value.publicId || typeof value.publicId !== 'string') {
  //     throw new Error('banners must have an string publicId property');
  //   }
  //   return true;
  // }),
  check('banners.*.url')
    .isString()
    .notEmpty()
    .withMessage('each banner must have an url field'),
  check('banners.*.publicId')
    .isString()
    .notEmpty()
    .withMessage('each banner must have an publicId field'),
  body('departmentId').isString().not().isEmpty(),
];

router.get('/list', list);
router.get('/list/:slug', fetchOne);
router.post('/create', isAuth, isAdmin, categoryValidator, create);
router.patch('/update/:slug', isAuth, isAdmin, categoryValidator, update);
router.delete('/delete/:slug', isAuth, isAdmin, deleteHandler);

export default router;
