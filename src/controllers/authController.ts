import { Request, Response } from 'express';
import cookie from 'cookie';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';
import User from '../models/User';
import admin from '../firebase';

dotenv.config();

export const signUpHandler = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    const isTaken = await User.findOne({ email }).select(['_id']).lean();

    if (isTaken) {
      throw new HttpException(400, 'Adress already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await new User({
      username,
      email,
      password: hashedPassword,
      authProvider: 'local',
    }).save();

    res.status(200).json({ message: 'user sign up successfully' });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const localSignIn = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).lean();

    if (!user) {
      throw new HttpException(400, 'No user found with these credentials');
    } else if (user.authProvider !== 'local') {
      throw new HttpException(
        400,
        `email already used by ${user.authProvider} login`
      );
    }

    const passComparison = await bcrypt.compare(password, user.password!);

    if (!passComparison) {
      throw new HttpException(400, 'Invalid password');
    }

    const secret = process.env.JWT_SECRET || 'some_secret_word';
    const token = jwt.sign(
      {
        username: user.username,
        createdAt: user.createdAt,
        email: user.email,
      },
      secret,
      {
        expiresIn: '2h',
      }
    );

    res.set(
      'Set-Cookie',
      cookie.serialize('token', JSON.stringify({ token, provider: 'local' }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600, // 3600
        path: '/',
      })
    );

    res.status(200).json({ user });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const firebaseSignIn = async (req: Request, res: Response) => {
  try {
    const { authResult }: any = req.body;
    const { token } = authResult;
    const firebaseUser = await admin.auth().verifyIdToken(token);

    // if not user, create one in DB
    let user = await User.findOne({ email: firebaseUser.email });

    if (!user) {
      user = new User({
        email: firebaseUser.email,
        username: firebaseUser.name,
        photoUrl: firebaseUser.picture,
        authProvuder: 'google',
      });

      await user.save();
    }

    res.set(
      'Set-Cookie',
      cookie.serialize(
        'token',
        JSON.stringify({ token, provider: 'firebase' }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3590, // 3600
          path: '/',
        }
      )
    );

    res.status(200).json({ user });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const meRequestHandler = async (req: Request, res: Response) => {
  try {
    const { user } = res.locals;

    if (!user) throw new HttpException(401, 'Not user authenticated');

    res.status(200).json({ user });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const logoutRequest = async (req: Request, res: Response) => {
  res.set(
    'Set-Cookie',
    cookie.serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    })
  );

  res.status(200).json({ message: 'user logout correctly' });
};
