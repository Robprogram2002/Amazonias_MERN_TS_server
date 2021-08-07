import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import slugify from 'slugify';
import { Types } from 'mongoose';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';
import Product from '../models/Product';
import { categoryLookUp, departmentLookUp } from '../utils/queries/LookUps';

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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    req.body.slug = slugify(req.body.title);

    // check that there is no product with the same name
    const isUsed = await Product.findOne({ slug: req.body.slug }).lean();

    if (isUsed) {
      throw new HttpException(400, 'Already exist a category with these name');
    }

    let newProduct: any;
    if (req.body.type === 'simple') {
      newProduct = await new Product({
        ...req.body,
        variants: null,
        productVariants: null,
      }).save();
    } else {
      newProduct = await new Product({
        ...req.body,
      }).save();
    }

    res.status(200).json(newProduct);
  } catch (error) {
    errorHandler(error, res);
    console.log(error);
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

export const adminFilter = async (req: Request, res: Response) => {
  try {
    const { text, department, category, subcategory } = req.body;

    let products: any[] = [];

    if (department && !category && !subcategory) {
      products = await Product.aggregate([
        {
          $match: {
            title: {
              $regex: text || '',
              $options: 'i',
            },
            departmentId: new Types.ObjectId(department),
          },
        },
        departmentLookUp,
        categoryLookUp,
      ]);
    } else if (department && category && !subcategory) {
      products = await Product.aggregate([
        {
          $match: {
            title: {
              $regex: text || '',
              $options: 'i',
            },
            departmentId: new Types.ObjectId(department),
            categoryId: new Types.ObjectId(category),
          },
        },
        departmentLookUp,
        categoryLookUp,
      ]);
    } else if (department && category && subcategory) {
      products = await Product.aggregate([
        {
          $match: {
            title: {
              $regex: text || '',
              $options: 'i',
            },
            departmentId: new Types.ObjectId(department),
            categoryId: new Types.ObjectId(category),
            subs: new Types.ObjectId(subcategory),
          },
        },
        departmentLookUp,
        categoryLookUp,
      ]);
    } else {
      products = await Product.aggregate([
        {
          $match: {
            title: {
              $regex: text || '',
              $options: 'i',
            },
          },
        },
        departmentLookUp,
        categoryLookUp,
      ]);
    }

    res.status(200).json(products);
  } catch (error) {
    errorHandler(error, res);
  }
};
