import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import slugify from 'slugify';
import { Types } from 'mongoose';
import Category from '../models/Category';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';

const departmentLookUp = {
  $lookup: {
    from: 'departments',
    as: 'department',
    let: {
      department: '$departmentId',
    },
    pipeline: [
      {
        $match: {
          $expr: {
            $eq: ['$_id', '$$department'],
          },
        },
      },
      {
        $project: {
          name: 1,
          _id: 1,
          slug: 1,
        },
      },
    ],
  },
};

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
    const { name, banners, departmentId, description } = req.body;
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
      slug: slugify(name),
      description,
    }).save();

    res.status(200).json(newCategory);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { name, banners, description, departmentId } = req.body;
    const { slug } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    const result = await Category.updateOne(
      { slug },
      {
        $set: {
          name,
          slug: slugify(name),
          banners,
          departmentId,
          description,
        },
      }
    );
    if (result.ok === 1 && result.nModified === 1) {
      res.status(200).json({ message: 'category updated successfully' });
    } else {
      throw new HttpException(404, 'No category was found with this slug');
    }
  } catch (error) {
    errorHandler(error, res);
  }
};

export const deleteHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await Category.deleteOne({ _id: Types.ObjectId(id) });

    if (result.ok === 1 && result.deletedCount === 1) {
      res.status(200).json({ message: 'category removed correctly' });
    } else {
      throw new HttpException(404, 'No category was found with this slug');
    }
  } catch (error) {
    errorHandler(error, res);
  }
};

export const listByDepartment = async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.params;
    const categories = await Category.find({ departmentId }).lean();

    res.status(200).json(categories);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const filterByText = async (req: Request, res: Response) => {
  try {
    const { text, department } = req.query;

    let categories: any[] = [];

    if (department && typeof department === 'string') {
      categories = await Category.aggregate([
        {
          $match: {
            name: {
              $regex: text || '',
              $options: 'i',
            },
            departmentId: new Types.ObjectId(department),
          },
        },
        departmentLookUp,
      ]);
    } else {
      categories = await Category.aggregate([
        {
          $match: {
            name: {
              $regex: text || '',
              $options: 'i',
            },
          },
        },
        departmentLookUp,
      ]);
    }
    res.status(200).json(categories);
  } catch (error) {
    errorHandler(error, res);
  }
};
