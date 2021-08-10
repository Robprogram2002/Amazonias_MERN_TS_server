import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
// import slugify from 'slugify';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';
import Brand from '../models/Brand';
import Product from '../models/Product';

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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    const { name, logo } = req.body;

    const brand = await new Brand({ logo, name }).save();

    res.status(200).json(brand);
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
    const { text } = req.query;
    let brands: any[] = [];

    if (typeof text === 'string') {
      brands = await Brand.find({
        name: {
          $regex: text,
          $options: 'i',
        },
      }).lean();
    } else {
      brands = await Brand.find({}).lean();
    }

    const data = await Promise.all(
      brands.map(async (brand) => {
        const productsCount = await Product.countDocuments({
          brand: brand.name,
        });
        return { ...brand, products: productsCount };
      })
    );

    res.status(200).json(data);
  } catch (error) {
    errorHandler(error, res);
  }
};
