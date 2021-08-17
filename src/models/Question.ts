import { Schema, model } from 'mongoose';

export interface IQuestion {
  _id: any;
  question: string;
  user: {
    userId: string;
    username: string;
  };
  answers: {
    content: string;
    user: {
      userId: Schema.Types.ObjectId;
      username: string;
      profileImage: string;
    };
    usefuls: {
      isUseful: number;
      userId: string;
    }[];
    createdAt: Date;
  }[];
  votes: {
    value: number;
    userId: string;
  }[];
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      minLength: [4, 'Too short question'],
      text: true,
    },
    user: {
      userId: Schema.Types.ObjectId,
      username: {
        type: String,
        required: true,
      },
    },
    answers: [
      {
        content: {
          type: String,
          required: true,
        },
        user: {
          userId: Schema.Types.ObjectId,
          username: String,
          profileImage: String,
        },
        usefuls: [
          {
            isUseful: Number,
            userId: String,
          },
        ],
        createdAt: Date,
      },
    ],
    votes: [
      {
        value: {
          type: Number,
          required: true,
        },
        userId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
      },
    ],
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
  },
  { timestamps: true }
);

export default model<IQuestion>('Question', questionSchema);
