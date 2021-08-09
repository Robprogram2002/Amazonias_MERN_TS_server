import { Request, Response } from 'express';
// import { validationResult } from 'express-validator';
// import slugify from 'slugify';
import { Types } from 'mongoose';
import SubCategory from '../models/SubCategory';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';
import { categoryLookUp } from '../utils/queries/LookUps';
import Brand from '../models/Brand';

export const list = async (req: Request, res: Response) => {
  try {
    const brands = await Brand.find({}).lean();

    res.status(200).json(brands);
  } catch (error) {
    errorHandler(error, res);
  }
};
export const fetchOne = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const brand = await Brand.findOne({ slug }).lean();

    res.status(200).json(brand);
  } catch (error) {
    errorHandler(error, res);
  }
};
export const create = async (req: Request, res: Response) => {
  try {
    res.status(200).json('hellooo');
  } catch (error) {
    errorHandler(error, res);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    res.status(200).json('hellooo');
  } catch (error) {
    errorHandler(error, res);
  }
};

export const deleteHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await Brand.deleteOne({ _id: id });

    if (result.ok === 1 && result.deletedCount === 1) {
      res.status(200).json({ message: 'brand removed correctly' });
    } else {
      throw new HttpException(404, 'not brand was found with this slug');
    }
  } catch (error) {
    errorHandler(error, res);
  }
};

export const filterByText = async (req: Request, res: Response) => {
  try {
    const { text, category } = req.query;

    let subcategories: any[] = [];

    if (category && typeof category === 'string') {
      subcategories = await SubCategory.aggregate([
        {
          $match: {
            name: {
              $regex: text || '',
              $options: 'i',
            },
            categoryId: new Types.ObjectId(category),
          },
        },
        categoryLookUp,
      ]);
    } else {
      subcategories = await SubCategory.aggregate([
        {
          $match: {
            name: {
              $regex: text || '',
              $options: 'i',
            },
          },
        },
        categoryLookUp,
      ]);
    }
    res.status(200).json(subcategories);
  } catch (error) {
    errorHandler(error, res);
  }
};
