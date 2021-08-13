import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import slugify from 'slugify';
import { Types } from 'mongoose';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';
import Product from '../models/Product';
import { categoryLookUp, departmentLookUp } from '../utils/queries/LookUps';

const addField = {
  $addFields: {
    rateCount: {
      $size: '$ratings',
    },
    averageRate: {
      $avg: '$ratings.star',
    },
  },
};

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

export const fetchHomeProducts = async (req: Request, res: Response) => {
  try {
    // const recentProducts = await Product.find({})
    //   .sort({ createdAt: -1 })
    //   .limit(12)
    //   .lean();
    const recentProducts = await Product.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 12 },
      addField,
    ]);

    // const mostSoldProducts = await Product.find({})
    //   .sort({ sold: -1 })
    //   .limit(12)
    //   .lean();
    const mostSoldProducts = await Product.aggregate([
      { $sort: { sold: -1 } },
      { $limit: 12 },
      addField,
    ]);

    // const onSaleProducts = await Product.find({ 'sale.onSale': true })
    //   .limit(12)
    //   .lean();
    const onSaleProducts = await Product.aggregate([
      {
        $match: {
          'sale.onSale': true,
        },
      },
      { $limit: 12 },
      addField,
    ]);

    const mostRatingProducts = await Product.aggregate([
      addField,
      {
        $sort: {
          rateCount: -1,
        },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      recentProducts,
      mostSoldProducts,
      onSaleProducts,
      mostRatingProducts,
    });
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

export const fetchStoreProducts = async (req: Request, res: Response) => {
  try {
    const { department, category, sub, price, condition, sort } = req.body;
    const brand = req.body.brand as string[];
    const vendor = req.body.vendor as string[];
    const rating = req.body.rating as number;

    console.log(req.body);
    console.log(sort);

    let matchObject: any = {};
    let sortObject: any = {};

    if (sub) {
      matchObject = {
        departmentId: new Types.ObjectId(department),
        categoryId: new Types.ObjectId(category),
        subs: new Types.ObjectId(sub),
      };
    } else if (category) {
      matchObject = {
        departmentId: new Types.ObjectId(department),
        categoryId: new Types.ObjectId(category),
      };
    } else {
      matchObject = {
        departmentId: new Types.ObjectId(department),
      };
    }

    if (price) {
      matchObject.basePrice = {
        $gte: +price[0],
        $lte: +price[1],
      };
    }

    if (brand && brand.length !== 0) {
      matchObject.brand = {
        $in: brand,
      };
    }

    if (vendor && vendor.length !== 0) {
      matchObject.vendor = {
        $in: vendor.map((id) => Types.ObjectId(id)),
      };
    }

    if (condition) {
      matchObject.condition = condition;
    }

    if (sort === 'average-review') {
      sortObject = {
        $sort: {
          averageRate: -1,
        },
      };
    } else if (sort === 'basePrice-desc') {
      sortObject = {
        $sort: {
          basePrice: -1,
        },
      };
    } else if (sort === 'basePrice-asc') {
      sortObject = {
        $sort: {
          basePrice: 1,
        },
      };
    }

    let products: any[];

    if (rating) {
      products = await Product.aggregate([
        {
          $match: matchObject,
        },
        addField,
        {
          $match: {
            averageRate: { $gte: rating },
          },
        },
        sortObject,
      ]);
    } else {
      products = await Product.aggregate([
        {
          $match: matchObject,
        },
        addField,
        sortObject,
      ]);
    }

    res.status(200).json(products);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const fetchProductPageData = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const product = await Product.aggregate([{ $match: { slug } }, addField]);

    //     $lookup: {
    //   from: 'categories',
    //   as: 'category',
    //   let: {
    //     category: '$categoryId',
    //   },
    //   pipeline: [
    //     {
    //       $match: {
    //         $expr: {
    //           $eq: ['$_id', '$$category'],
    //         },
    //       },
    //     },
    //     {
    //       $project: {
    //         name: 1,
    //         _id: 1,
    //         slug: 1,
    //       },
    //     },
    //     {
    //       $limit: 1,
    //     },
    //   ],
    // },

    res.status(200).json(product);
  } catch (error) {
    errorHandler(error, res);
  }
};
