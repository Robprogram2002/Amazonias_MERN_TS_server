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
    }).save();

    res.status(200).json(newSub);
  } catch (error) {
    errorHandler(error, res);
  }
};
export const update = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    const updated = await SubCategory.updateOne(
      { name },
      {
        $set: {
          name,
          slug: slugify(name),
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

    await SubCategory.deleteOne({ slug });

    res.status(200).json({ message: 'sub-category removed correctly' });
  } catch (error) {
    errorHandler(error, res);
  }
};
