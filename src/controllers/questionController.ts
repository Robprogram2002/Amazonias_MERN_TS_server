import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';
import Question, { IQuestion } from '../models/Question';
import Product from '../models/Product';
import { IUser } from '../models/User';

const addField = {
  $addFields: {
    averageVote: { $sum: '$votes.value' },
  },
};

export const list = async (req: Request, res: Response) => {
  try {
    const { productSlug } = req.params;
    const userId = req.query.userId as string | null;
    const text = req.query.text as string | null;

    const product = await Product.findOne({ slug: productSlug })
      .select('_id title slug')
      .lean();

    if (!product) {
      throw new HttpException(404, 'No product was found this this slug');
    }

    const questions = await Question.aggregate<IQuestion>([
      {
        $match: {
          productId: new Types.ObjectId(product._id.toString()),
          question: { $regex: text || '', $options: 'i' },
        },
      },
      addField,
    ]);

    if (userId) {
      const modifiedQuestions = questions.map((question) => {
        const index = question.votes.findIndex(
          (vote) => vote.userId.toString() === userId.toString()
        );

        if (index !== -1) {
          // the user has already vote this question
          return { ...question, userVote: question.votes[index].value };
        }

        // the user has not vote this question yet
        return { ...question, userVote: 0 };
      });

      res.status(200).json(modifiedQuestions);
    } else {
      // there is not authenticated user
      res.status(200).json(questions);
    }
  } catch (error) {
    errorHandler(error, res);
  }
};

export const fetchOne = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;

    const question = await Question.aggregate([
      { $match: { _id: new Types.ObjectId(questionId) } },
      addField,
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

    if (question.length === 0) {
      throw new HttpException(404, 'No question was found with this id');
    }

    const result = question[0];

    console.log(result);

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

    const { question, productId } = req.body;
    const { username, _id } = res.locals.user as IUser;

    const newQuestion = await new Question({
      user: { username, userId: _id },
      question,
      productId,
    }).save();

    res.status(200).json(newQuestion);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const deleteHandler = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const user = res.locals.user as IUser;

    // const result = await Question.deleteOne({ _id: questionId })
    const question = await Question.findById(questionId);

    if (!question) {
      throw new HttpException(404, 'Not question faund with this Id');
    }

    if (question.user.userId.toString() !== user._id.toString()) {
      throw new HttpException(401, 'Not authorized, do not own this question');
    }

    await question.delete();

    // if (result.ok === 1 && result.deletedCount === 1) {
    //   res.status(200).json({ message: 'question removed correctly' });
    // } else {
    //   throw new HttpException(404, 'not question was found with this id');
    // }

    res.status(200).json({ message: 'question removed correctly' });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const filterByText = async (req: Request, res: Response) => {
  try {
    const { text } = req.query;
    let questions: any[] = [];

    if (typeof text === 'string') {
      questions = await Question.find({
        question: {
          $regex: text,
          $options: 'i',
        },
      }).lean();
    } else {
      questions = await Question.find({}).lean();
    }

    res.status(200).json(questions);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const addResponse = async (req: Request, res: Response) => {
  try {
    const { content, questionId } = req.body;
    const { username, _id, photoUrl } = res.locals.user as IUser;

    const updated = await Question.updateOne(
      { _id: questionId },
      {
        $push: {
          answers: {
            user: { userId: _id, username, profileImage: photoUrl },
            content,
            createdAt: new Date(),
          },
        },
      }
    );

    if (updated.nModified !== 1 && updated.ok !== 1) {
      throw new HttpException(500, 'something went wrong with database');
    }

    res.status(200).json({ message: 'all good' });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const addVote = async (req: Request, res: Response) => {
  try {
    const { value, questionId } = req.body;
    const { _id } = res.locals.user as IUser;

    const question = await Question.findById(questionId);

    if (!question) {
      throw new HttpException(404, 'not question was found with this id');
    }

    const index = question.votes.findIndex(
      (vote) => vote.userId.toString() === _id.toString()
    );

    if (index === -1) {
      // add vote
      question.votes.push({ value, userId: _id });
    } else {
      const existingVote = question.votes[index];
      if (existingVote.value === value) {
        //   remove it if the value is the same
        question.votes.splice(index, 1);
      } else {
        // update it if the value is different
        question.votes[index].value = value;
      }
    }

    await question.save();

    res.status(200).json({ message: 'all good' });
  } catch (error) {
    errorHandler(error, res);
  }
};
