import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import User, { IUser } from '../models/User';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';

export const addUserShippingAddress = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    const { _id } = res.locals.user as IUser;

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    const adressId = new Types.ObjectId();

    const result = await User.updateOne(
      { _id },
      {
        $push: { shippingAddresses: { ...req.body, _id: adressId } },
      }
    );

    if (result.nModified !== 1 && result.ok !== 1) {
      throw new HttpException(500, 'something went wrong with database');
    }

    res.status(200).json({ ...req.body, _id: adressId });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const removeUserAddress = async (req: Request, res: Response) => {
  try {
    const { addressId } = req.params;
    const { _id } = res.locals.user as IUser;

    const user = await User.findById(_id).select('shippingAddresses');

    if (!user) {
      throw new HttpException(401, 'No authenticated user was found');
    }

    let newArray = [...user.shippingAddresses];
    newArray = newArray.filter(
      (address) => address._id.toString() !== addressId.toString()
    );

    user.shippingAddresses = newArray;

    await user.save();

    res.status(200).json(newArray);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const editUserShippingAddress = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    const { addressId } = req.params;
    const { _id } = res.locals.user as IUser;

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    const user = await User.findById(_id).select('shippingAddresses');

    if (!user) {
      throw new HttpException(401, 'No authenticated user was found');
    }

    const index = user.shippingAddresses.findIndex(
      (address) => address._id.toString() === addressId.toString()
    );

    if (index === -1) {
      throw new HttpException(404, 'No address  was found');
    }

    user.shippingAddresses[index] = { ...req.body };
    await user.save();

    res.status(200).json(user.shippingAddresses);
  } catch (error) {
    errorHandler(error, res);
  }
};
