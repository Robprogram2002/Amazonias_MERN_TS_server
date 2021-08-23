import { Request, Response } from 'express';
import cookie from 'cookie';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';
import User, { IUser } from '../models/User';
import admin from '../firebase';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  typescript: true,
  apiVersion: '2020-08-27',
});

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

    const secret = process.env.JWT_SECRET_EMAIL || 'some_secret_word';
    const token = jwt.sign(
      {
        username,
        createdAt: new Date(),
        email,
      },
      secret,
      {
        expiresIn: '7d',
      }
    );

    const msg = {
      to: { email, name: username },
      from: {
        name: 'Amazonias Accounts',
        email: 'robert.laksee20@gmail.com',
      },
      templateId: 'd-d9afe15898b04c42b3ea3a55e3945df5',
      dynamicTemplateData: {
        username,
        url: `${process.env.CLIENT_ORIGIN}/verify-email/${token}`,
      },
    };

    await sgMail.send(msg);

    res.status(200).json({ message: 'user sign up successfully' });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const emailVerificationHandler = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const result = jwt.verify(token, process.env.JWT_SECRET_EMAIL!);
    if (typeof result !== 'string') {
      const { email } = result;
      await User.updateOne({ email }, { $set: { emailVerified: true } });
    }

    res.status(200).json({ message: 'email verified successfuly' });
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
    } else if (!user.emailVerified) {
      throw new HttpException(400, 'This email address has not been verified');
    }

    const passComparison = await bcrypt.compare(password, user.password!);

    if (!passComparison) {
      throw new HttpException(400, 'Invalid password');
    }

    // user pass validations
    if (!user.payment || !user.payment.customerId) {
      const customer = await stripe.customers.create({
        email,
        name: user.username,
      });

      await User.updateOne(
        { _id: user._id },
        {
          payment: {
            customerId: customer.id,
            methods: [],
          },
        }
      );
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
    let user = await User.findOne({ email: firebaseUser.email }).populate(
      'cart.products.product',
      'title basePrice images slug ratings currency availability stock _id',
      'Product'
    );

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
    const { _id } = res.locals.user as IUser;

    const user = await User.findById(_id)
      .populate(
        'cart.products.product',
        'title basePrice images slug ratings currency availability stock _id',
        'Product'
      )
      .lean();

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
