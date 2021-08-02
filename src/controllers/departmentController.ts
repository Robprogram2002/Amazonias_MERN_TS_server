import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import slugify from 'slugify';
import { Types } from 'mongoose';
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
    const { name, banners, description } = req.body;
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

    const newDepartment = await new Department({
      name,
      banners,
      slug: slugify(name),
      description,
    }).save();

    res.status(200).json(newDepartment);
  } catch (error) {
    errorHandler(error, res);
  }
};
export const update = async (req: Request, res: Response) => {
  try {
    const { name, banners, description } = req.body;
    const { slug } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    const result = await Department.updateOne(
      { slug },
      {
        $set: {
          name,
          slug: slugify(name),
          banners,
          description,
        },
      }
    );

    if (result.ok === 1 && result.nModified === 1) {
      res.status(200).json({ message: 'department updated successfully' });
    } else {
      throw new HttpException(404, 'No department was found with this slug');
    }
  } catch (error) {
    errorHandler(error, res);
  }
};
export const deleteHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await Department.deleteOne({ _id: Types.ObjectId(id) });

    if (result.ok === 1 && result.deletedCount === 1) {
      res.status(200).json({ message: 'department removed correctly' });
    } else {
      throw new HttpException(404, 'No department was found with this slug');
    }
  } catch (error) {
    errorHandler(error, res);
  }
};

export const filterByText = async (req: Request, res: Response) => {
  try {
    const { text } = req.query;

    if (typeof text === 'string') {
      // const departments = await Department.find({
      //   $text: { $search: text },
      // }).lean();
      const departments = await Department.find({
        name: { $regex: text, $options: 'i' },
      }).lean();

      res.status(200).json(departments);
    } else if (text === undefined) {
      const departments = await Department.find({}).lean();
      res.status(200).json(departments);
    } else {
      res.status(400).json(req.query);
    }
  } catch (error) {
    errorHandler(error, res);
  }
};
