import { Router } from 'express';
import { body } from 'express-validator';
import isAuth from '../middlewares/isAuth';

import {
  create,
  deleteHandler,
  fetchOne,
  list,
  filterByText,
  addResponse,
  addVote,
} from '../controllers/questionController';

const router = Router();

const questionValidator = [
  body('question')
    .isString()
    .notEmpty()
    .trim()
    .isLength({ min: 4 })
    .withMessage('question must be at least 4 characters long'),
  body('productId')
    .notEmpty()
    .isString()
    .withMessage(
      'is required the id of the producct which this question belongs to'
    ),
];

const responseValidator = [
  body('content').isString().notEmpty().trim().isLength({ min: 2 }),
  body('questionId').notEmpty().isString(),
];

const voteValidator = [
  body('questionId').notEmpty().isString(),
  body('value').custom((value) => {
    if (value !== 1 && value !== -1) {
      throw new Error('value must be either 1 (up vote) or -1 (down vote)');
    }
    return true;
  }),
];

router.get('/list/:productSlug', list);
router.get('/fetch-one/:questionId', fetchOne);
router.get('/filter/by-text', filterByText);
router.post('/create', isAuth, questionValidator, create);
router.post('/response', isAuth, responseValidator, addResponse);
router.post('/vote', isAuth, voteValidator, addVote);
router.delete('/delete/:id', isAuth, deleteHandler);

export default router;
