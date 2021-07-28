import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import slugify from 'slugify';
import SubCategory from '../models/SubCategory';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';

export const list = async (req: Request, res: Response) => {
  try {
    const subCategories = await SubCategory.find({}).lean();

    res.status(200).json(subCategories);
  } catch (error) {
    errorHandler(error, res);
  }
};
export const fetchOne = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const subCategory = await SubCategory.findOne({ slug }).lean();

    res.status(200).json(subCategory);
  } catch (error) {
    errorHandler(error, res);
  }
};
export const create = async (req: Request, res: Response) => {
  try {
    const { name, categoryId } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    // check that there is no subcategory with the same name
    const isUsed = await SubCategory.findOne({ name }).lean();

    if (isUsed) {
      throw new HttpException(
        400,
        'Already exist a subcategory with these name'
      );
    }

    const newSub = await new SubCategory({
      name,
      categoryId,
      slug: slugify(name),
    }).save();

    res.status(200).json(newSub);
  } catch (error) {
    errorHandler(error, res);
  }
};
export const update = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const { slug } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    const result = await SubCategory.updateOne(
      { slug },
      {
        $set: {
          name,
          slug: slugify(name),
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
    const { slug } = req.params;

    const result = await SubCategory.deleteOne({ slug });

    if (result.ok === 1 && result.deletedCount === 1) {
      res.status(200).json({ message: 'sub-category removed correctly' });
    } else {
      throw new HttpException(404, 'No sub-category was found with this slug');
    }
  } catch (error) {
    errorHandler(error, res);
  }
};
