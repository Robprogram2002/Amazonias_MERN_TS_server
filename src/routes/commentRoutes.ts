import { Router } from 'express';
import { body, check } from 'express-validator';
import isAuth from '../middlewares/isAuth';

import {
  create,
  deleteHandler,
  fetchOne,
  list,
  likeComment,
  listWithImages,
} from '../controllers/commentController';

const router = Router();

const commentValidator = [
  body('title')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage(
      'question must be at least 2 characters long and at must 100 characters long'
    ),
  body('rate')
    .notEmpty()
    .toFloat()
    .isFloat({ min: 0, max: 5 })
    .withMessage(
      'rate must be a number greater than or equal to 0 and lower than or equal to 5'
    ),
  body('content').notEmpty().isString(),
  body('origin').notEmpty().isString(),
  body('images').isArray().withMessage('images must be an array'),
  check('images.*.url')
    .isString()
    .withMessage('each image must have an url field'),
  check('images.*.publicId')
    .isString()
    .withMessage('each image must have an publicId field'),
  body('productId')
    .notEmpty()
    .isString()
    .withMessage(
      'is required the id of the product which this comment belongs to'
    ),
];

router.get('/list/:productSlug', list);
router.get('/list/with-images/:productSlug', listWithImages);
router.get('/fetch-one/:commentId', fetchOne);
router.post('/create', isAuth, commentValidator, create);
router.post('/vote', isAuth, likeComment);
router.delete('/delete/:id', isAuth, deleteHandler);

export default router;
