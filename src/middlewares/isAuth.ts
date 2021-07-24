import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import admin from '../firebase';
import User from '../models/User';

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { token } = req.cookies;

    if (!token) throw new Error('User not authenticated');

    token = JSON.parse(token);

    if (token.provider === 'local') {
      const result = jwt.decode(token.token, { complete: true, json: false });
      res.locals.user = await User.findOne({ email: result?.payload.email });
    } else {
      const firebaseUser = await admin.auth().verifyIdToken(token);
      res.locals.user = await User.findOne({ email: firebaseUser.email });
    }

    next();
  } catch (err) {
    res.status(401).json({
      error: 'Invalid or expired token',
    });
  }
};
