import { Request, Response } from 'express';
// import { validationResult } from 'express-validator';
// import slugify from 'slugify';
import { Types } from 'mongoose';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';
import Product from '../models/Product';

export const list = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({}).lean();

    res.status(200).json(products);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const fetchOne = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug }).lean();

    res.status(200).json(product);
  } catch (error) {
    errorHandler(error, res);
  }
};
export const create = async (req: Request, res: Response) => {
  try {
    res.status(200).json({});
  } catch (error) {
    errorHandler(error, res);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    res.status(200).json({});
  } catch (error) {
    errorHandler(error, res);
  }
};

export const deleteHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await Product.deleteOne({ _id: Types.ObjectId(id) });

    if (result.ok === 1 && result.deletedCount === 1) {
      res.status(200).json({ message: 'product removed correctly' });
    } else {
      throw new HttpException(404, 'No product was found with this id');
    }
  } catch (error) {
    errorHandler(error, res);
  }
};

export const listByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ categoryId }).lean();

    res.status(200).json(products);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const filterByText = async (req: Request, res: Response) => {
  try {
    res.status(200).json({});
  } catch (error) {
    errorHandler(error, res);
  }
};
