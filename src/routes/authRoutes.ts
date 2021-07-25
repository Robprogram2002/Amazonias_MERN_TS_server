import { Router } from 'express';
import { body } from 'express-validator';
import isAuth from '../middlewares/isAuth';
import {
  signUpHandler,
  meRequestHandler,
  logoutRequest,
  localSignIn,
  firebaseSignIn,
  emailVerificationHandler,
} from '../controllers/authController';

const router = Router();

const signUpValidator = [
  body('email')
    .isEmail()
    .withMessage('enter a valid email address')
    .trim()
    .withMessage('A valid email address is needed'),
  body('password')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ max: 50, min: 8 })
    .withMessage('password must be at least 8 characters long'),
  body('username')
    .isString()
    .trim()
    .isLength({ max: 50, min: 3 })
    .withMessage('username must be at least 3 characters long'),
];

router.post('/sign-up', signUpValidator, signUpHandler);
router.post('/local-signin', localSignIn);
router.post('/firebase-signin', firebaseSignIn);
router.patch('/verify-email', emailVerificationHandler);
router.get('/me', isAuth, meRequestHandler);
router.get('/logout', logoutRequest);

export default router;
