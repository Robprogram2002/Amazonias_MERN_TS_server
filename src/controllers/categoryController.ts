import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import slugify from 'slugify';
import Category from '../models/Category';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';

export const list = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({}).lean();

    res.status(200).json(categories);
  } catch (error) {
    errorHandler(error, res);
  }
};
export const fetchOne = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug }).lean();

    res.status(200).json(category);
  } catch (error) {
    errorHandler(error, res);
  }
};
export const create = async (req: Request, res: Response) => {
  try {
    const { name, banners, departmentId } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    // check that there is no category with the same name
    const isUsed = await Category.findOne({ name }).lean();

    if (isUsed) {
      throw new HttpException(400, 'Already exist a category with these name');
    }

    const newCategory = await new Category({
      name,
      banners,
      departmentId,
    }).save();

    res.status(200).json(newCategory);
  } catch (error) {
    errorHandler(error, res);
  }
};
export const update = async (req: Request, res: Response) => {
  try {
    const { name, banners } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    const updated = await Category.updateOne(
      { name },
      {
        $set: {
          name,
          slug: slugify(name),
          banners,
        },
      },
      { new: true }
    );
    console.log(updated);
    res.status(200).json(updated);
  } catch (error) {
    errorHandler(error, res);
  }
};
export const deleteHandler = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    await Category.deleteOne({ slug });

    res.status(200).json({ message: 'category removed correctly' });
  } catch (error) {
    errorHandler(error, res);
  }
};
