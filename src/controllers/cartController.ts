import { Request, Response } from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import Product, { IProduct } from '../models/Product';
import User, { IUser } from '../models/User';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  typescript: true,
  apiVersion: '2020-08-27',
});

export const addProductHandler = async (req: Request, res: Response) => {
  try {
    const { productId, quantity, price } = req.body;
    const { cart, _id } = res.locals.user as IUser;

    // check if the product is already in the cart
    const index = cart.products.findIndex(
      ({ product }) => product.toString() === productId.toString()
    );

    if (index !== -1) {
      // already in cart, update count and return the new count
      const newQuantity = cart.products[index].count + quantity;
      cart.products[index].count += newQuantity;
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

      res.status(200).json({
        index,
        quantity: newQuantity,
        totalAmount: cart.totalAmount,
        status: 'duplicated',
      });
    } else {
      // not in the cart, add it and return the product
      cart.products.push({ product: productId, count: quantity });
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

      const product = await Product.findById(productId).lean();

      res.status(200).json({
        product,
        status: 'new',
        quantity,
        totalAmount: cart.totalAmount,
      });
    }
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

    res.status(200).json({ index, totalAmount: cart.totalAmount });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const editProdutcQuantity = async (req: Request, res: Response) => {
  try {
    const { productId, price, quantity } = req.body;
    const { cart, _id } = res.locals.user as IUser;

    const index = cart.products.findIndex(
      ({ product }) => product.toString() === productId.toString()
    );

    cart.totalAmount += (quantity - cart.products[index].count) * price;
    cart.products[index].count = quantity;

    const result = await User.updateOne(
      { _id },
      {
        cart,
      }
    );

    if (result.nModified !== 1 && result.ok !== 1) {
      throw new HttpException(500, 'something went wrong with database');
    }

    res.status(200).json({ index, quantity, totalAmount: cart.totalAmount });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const getCompleteCart = async (req: Request, res: Response) => {
  try {
    const { _id } = res.locals.user as IUser;
    const user = await User.findById(_id)
      .select('cart')
      .populate(
        'cart.products.product',
        'title basePrice images slug ratings',
        'Product'
      )
      .lean();

    if (!user) {
      throw new HttpException(401, 'Not authenticated user was found');
    }

    res.status(200).json(user.cart);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const createCheckOutSession = async (req: Request, res: Response) => {
  try {
    const cart = req.body.cart as IUser['cart'];

    const checkoutProducts = cart.products.map(
      ({ product, count }: { product: IProduct; count: number }) => ({
        price_data: {
          currency: 'mxn',
          product_data: {
            name: product.title,
            images: product.images.map(({ url }) => url),
          },
          // tax_behavior: 'inclusive',
          tax_behavior: undefined,
          unit_amount_decimal: (product.basePrice * 100).toFixed(2),
        },
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
          maximum: product.stock - 1,
        },
        quantity: count,
      })
    );

    const session = await stripe.checkout.sessions.create({
      submit_type: 'pay',
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'MX'],
      },
      shipping_rates: ['shr_1JRAQWAVMjgXuTmLbPEvwkih'],
      automatic_tax: {
        enabled: false,
      },
      allow_promotion_codes: true,
      // discounts: [
      //   {
      //     coupon: 'uKHo3t4S',
      //   },
      // ],
      line_items: checkoutProducts,
      payment_method_types: ['card', 'oxxo'],
      mode: 'payment',
      success_url: `${process.env.CLIENT_ORIGIN}/user/checkout?success=true?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_ORIGIN}/user/checkout?canceled=true`,
    });
    res.status(200).json(session.id);
  } catch (error) {
    console.log(error);
    errorHandler(error, res);
  }
};

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const cart = req.body.cart as IUser['cart'];
    const customerId = req.body.customerId as string | null;

    let id: string;
    if (customerId) {
      id = customerId;
    } else {
      const customer = await stripe.customers.create({ name: 'guest' });
      id = customer.id;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      customer: id,
      setup_future_usage: 'off_session',
      amount: cart.totalAmount,
      currency: 'usd',
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log(error);
    errorHandler(error, res);
  }
};

export const createSetUpIntent = async (req: Request, res: Response) => {
  try {
    const customerId = req.body.customerId as string | null;

    let id: string;
    if (customerId) {
      id = customerId;
    } else {
      const customer = await stripe.customers.create({ name: 'guest' });
      id = customer.id;
    }

    const intent = await stripe.setupIntents.create({
      customer: id,
      usage: 'on_session',
    });

    res.status(200).json({
      clientSecret: intent.client_secret,
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

// const chargeCustomer = async (customerId: string) => {
//   // Lookup the payment methods available for the customer
//   const paymentMethods = await stripe.paymentMethods.list({
//     customer: customerId,
//     type: 'card',
//   });
//   // Charge the customer and payment method immediately
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: 1099,
//     currency: 'usd',
//     customer: customerId,
//     payment_method: paymentMethods.data[0].id,
//     off_session: true,
//     confirm: true,
//   });
//   if (paymentIntent.status === 'succeeded') {
//     console.log('✅ Successfully charged card off session');
//   }
// };
