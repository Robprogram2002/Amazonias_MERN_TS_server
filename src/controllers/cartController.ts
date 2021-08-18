import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';

export const addProductHandler = async (req: Request, res: Response) => {
  try {
    const { productId, quantity, price } = req.body;
    const { cart, _id } = res.locals.user as IUser;

    // check if the product is already in the cart
    const index = cart.products.findIndex(
      ({ product }) => product.toString() === productId.toString()
    );

    if (index !== -1) {
      // already in cart, update count
      cart.products[index].count += quantity;
    } else {
      // not in the cart, add it
      cart.products.push({ product: productId, count: quantity });
    }

    cart.totalAmount += price * quantity;

    const result = await User.updateOne(
      { _id },
      {
        cart,
      }
    );

    if (result.nModified !== 1 && result.ok !== 1) {
      throw new HttpException(500, 'something went wrong with database');
    }

    res.status(200).json(cart);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const removeProductHandler = async (req: Request, res: Response) => {
  try {
    const { productId, price } = req.body;
    const { cart, _id } = res.locals.user as IUser;

    // get the index of the product to be removed
    const index = cart.products.findIndex(
      ({ product }) => product.toString() === productId.toString()
    );

    const removedProduct = cart.products.splice(index, 1)[0];

    cart.totalAmount -= price * removedProduct.count;

    const result = await User.updateOne(
      { _id },
      {
        cart,
      }
    );

    if (result.nModified !== 1 && result.ok !== 1) {
      throw new HttpException(500, 'something went wrong with database');
    }

    res.status(200).json(cart);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const editProdutcQuantity = async (req: Request, res: Response) => {
  try {
    const { productId, price, action } = req.body;
    const { cart, _id } = res.locals.user as IUser;

    const index = cart.products.findIndex(
      ({ product }) => product.toString() === productId.toString()
    );

    if (action === 'add') {
      cart.products[index].count += 1;
      cart.totalAmount += price;
    } else {
      cart.products[index].count -= 1;
      cart.totalAmount -= price;
    }

    const result = await User.updateOne(
      { _id },
      {
        cart,
      }
    );

    if (result.nModified !== 1 && result.ok !== 1) {
      throw new HttpException(500, 'something went wrong with database');
    }

    res.status(200).json(cart);
  } catch (error) {
    errorHandler(error, res);
  }
};
