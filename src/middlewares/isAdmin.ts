import { Request, Response, NextFunction } from 'express';

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = res.locals;

    if (!user) throw new Error('User not authenticated');

    if (user.role !== 'Admin') {
      throw new Error('');
    } else {
      next();
    }
  } catch (err) {
    res.status(401).json({ error: 'Admin resource. Access denied.' });
  }
};
