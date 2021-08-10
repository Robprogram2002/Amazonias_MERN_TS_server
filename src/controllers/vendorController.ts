import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import slugify from 'slugify';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';
import Vendor from '../models/Vendor';
import Product from '../models/Product';

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

    if (vendor === null) {
      throw new HttpException(404, 'Not vendor found with this slug', null);
    }

    res.status(200).json(vendor);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const fetchOneWithProducts = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const vendor = await Vendor.findOne({ slug }).lean();

    if (vendor === null) {
      throw new HttpException(404, 'Not vendor found with this slug', null);
    }

    const products = await Product.find({ vendor: vendor._id });

    res.status(200).json({ ...vendor, products });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    req.body.slug = slugify(req.body.name);

    const vendor = await new Vendor({ ...req.body }).save();

    res.status(200).json(vendor);
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
    const { text } = req.query;

    let vendors: any[] = [];

    if (typeof text === 'string') {
      vendors = await Vendor.find({
        name: {
          $regex: text,
          $options: 'i',
        },
      }).lean();
    } else {
      vendors = await Vendor.find({}).lean();
    }

    res.status(200).json(vendors);
  } catch (error) {
    errorHandler(error, res);
  }
};
