import { Router } from 'express';
import { body } from 'express-validator';
import isAuth from '../middlewares/isAuth';
import isAdmin from '../middlewares/isAdmin';

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
    .custom((value) => {
      if (!value.url || typeof value.url !== 'string') {
        throw new Error('banners must have an string url property');
      } else if (!value.publicId || typeof value.publicId !== 'string') {
        throw new Error('banners must have an string publicId property');
      }
      return true;
    }),
  body('departmentId').isString().not().isEmpty(),
];

router.get('/list');
router.get('/list/:slug');
router.post('/create', isAuth, isAdmin, categoryValidator);
router.patch('/update/:slug', isAuth, isAdmin, categoryValidator);
router.delete('/delete/:slug', isAuth, isAdmin);

export default router;
