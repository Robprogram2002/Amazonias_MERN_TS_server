import { Request, Response } from 'express';
// import { validationResult } from 'express-validator';
// import slugify from 'slugify';
import { Types } from 'mongoose';
import SubCategory from '../models/SubCategory';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';
import { categoryLookUp } from '../utils/queries/LookUps';
import Vendor from '../models/Vendor';

export const list = async (req: Request, res: Response) => {
  try {
    const vendors = await Vendor.find({}).lean();

    res.status(200).json(vendors);
  } catch (error) {
    errorHandler(error, res);
  }
};
export const fetchOne = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const vendor = await Vendor.findOne({ slug }).lean();

    res.status(200).json(vendor);
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

    const result = await Vendor.deleteOne({ _id: id });

    if (result.ok === 1 && result.deletedCount === 1) {
      res.status(200).json({ message: 'vendor removed correctly' });
    } else {
      throw new HttpException(404, 'not vendor was found with this slug');
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
