import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import slugify from 'slugify';
import Department from '../models/Department';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';

export const list = async (req: Request, res: Response) => {
  try {
    const departments = await Department.find({}).lean();

    res.status(200).json(departments);
  } catch (error) {
    errorHandler(error, res);
  }
};
export const fetchOne = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const department = await Department.findOne({ slug }).lean();

    res.status(200).json(department);
  } catch (error) {
    errorHandler(error, res);
  }
};
export const create = async (req: Request, res: Response) => {
  try {
    const { name, banners } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    // check that there is no department with the same name
    const isUsed = await Department.findOne({ name }).lean();

    if (isUsed) {
      throw new HttpException(
        400,
        'Already exist a department with these name'
      );
    }

    const newDepartment = await new Department({ name, banners }).save();

    res.status(200).json(newDepartment);
  } catch (error) {
    errorHandler(error, res);
  }
};
export const update = async (req: Request, res: Response) => {
  try {
    const { name, banners } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    const updated = await Department.updateOne(
      { name },
      {
        $set: {
          name,
          slug: slugify(name),
          banners,
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

    await Department.deleteOne({ slug });

    res.status(200).json({ message: 'department removed correctly' });
  } catch (error) {
    errorHandler(error, res);
  }
};
