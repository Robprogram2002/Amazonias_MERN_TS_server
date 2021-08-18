import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';
import Comment, { IComment } from '../models/Comment';
import Product from '../models/Product';
import { IUser } from '../models/User';

export const list = async (req: Request, res: Response) => {
  try {
    const { productSlug } = req.params;
    const userId = req.query.userId as string | null;
    const text = req.query.text as string | null;

    const product = await Product.findOne({ slug: productSlug })
      .select('_id title slug')
      .lean();

    console.log(product);

    if (!product) {
      throw new HttpException(404, 'No product was found this this slug');
    }

    const comments = await Comment.aggregate<IComment>([
      {
        $match: {
          productId: new Types.ObjectId(product._id.toString()),
          title: { $regex: text || '', $options: 'i' },
        },
      },
    ]);

    if (userId) {
      const modifiedComments = comments.map((comment) => {
        const index = comment.likes.findIndex(
          (id) => id.toString() === userId.toString()
        );

        if (index !== -1) {
          // the user has already vote this comment
          return { ...comment, userVote: true };
        }

        // the user has not vote this comment yet
        return { ...comment, userVote: false };
      });

      res.status(200).json(modifiedComments);
    } else {
      // there is not authenticated user
      res.status(200).json(comments);
    }
  } catch (error) {
    errorHandler(error, res);
  }
};

export const listWithImages = async (req: Request, res: Response) => {
  try {
    const slug = req.params.productSlug as string;
    const userId = req.query.userId as string | null;

    const product = await Product.findOne({ slug })
      .select('_id title slug')
      .lean();

    if (!product) {
      throw new HttpException(404, 'No product was found this this slug');
    }

    const comments = await Comment.aggregate<IComment>([
      {
        $match: {
          productId: new Types.ObjectId(product._id.toString()),
          'images.0': { $exists: true },
        },
      },
    ]);

    if (userId) {
      const modifiedComments = comments.map((comment) => {
        const index = comment.likes.findIndex(
          (id) => id.toString() === userId.toString()
        );

        if (index !== -1) {
          // the user has already vote this comment
          return { ...comment, userVote: true };
        }

        // the user has not vote this comment yet
        return { ...comment, userVote: false };
      });

      res.status(200).json(modifiedComments);
    } else {
      // there is not authenticated user
      res.status(200).json(comments);
    }
  } catch (error) {
    errorHandler(error, res);
  }
};

export const fetchOne = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.aggregate([
      { $match: { _id: new Types.ObjectId(commentId) } },
      {
        $lookup: {
          from: 'products',
          as: 'product',
          let: {
            id: '$productId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$id'],
                },
              },
            },
            {
              $project: {
                images: 1,
                _id: 1,
                slug: 1,
                title: 1,
              },
            },
          ],
        },
      },
    ]);

    if (comment.length === 0) {
      throw new HttpException(404, 'No comment was found with this id');
    }

    const result = comment[0];

    res.status(200).json({ ...result, product: result.product[0] });
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

    const { title, content, rate, productId, origin, images } = req.body;
    const { username, _id, photoUrl } = res.locals.user as IUser;

    const newComment = await new Comment({
      customer: { username, userId: _id, photoUrl },
      title,
      productId,
      content,
      rate,
      origin,
      images: images && images.length > 0 ? images : [],
    }).save();

    const result = await Product.updateOne(
      { _id: productId },
      { $push: { ratings: { star: rate, postedBy: _id } } }
    );

    if (result.nModified !== 1 && result.ok !== 1) {
      throw new HttpException(500, 'something went wrong with database');
    }

    res.status(200).json(newComment);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const deleteHandler = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const user = res.locals.user as IUser;

    // const result = await comment.deleteOne({ _id: commentId })
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new HttpException(404, 'Not comment faund with this Id');
    }

    if (comment.customer.userId.toString() !== user._id.toString()) {
      throw new HttpException(401, 'Not authorized, do not own this comment');
    }

    await comment.delete();

    // if (result.ok === 1 && result.deletedCount === 1) {
    //   res.status(200).json({ message: 'comment removed correctly' });
    // } else {
    //   throw new HttpException(404, 'not comment was found with this id');
    // }

    res.status(200).json({ message: 'comment removed correctly' });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const likeComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.body;
    const { _id } = res.locals.user as IUser;

    const comment = await Comment.findById(commentId).select('likes _id');

    if (!comment) {
      throw new HttpException(404, 'not comment was found with this id');
    }

    const index = comment.likes.findIndex(
      (userId) => userId.toString() === _id.toString()
    );

    if (index === -1) {
      // add vote
      comment.likes.push(_id);
    } else {
      // the user already has like this comment
      // remove that like
      comment.likes.splice(index, 1);
    }

    await comment.save();

    res.status(200).json({ message: 'all good' });
  } catch (error) {
    errorHandler(error, res);
  }
};
