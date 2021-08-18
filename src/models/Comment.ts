import { Schema, model } from 'mongoose';

export interface IComment {
  _id: string;
  customer: {
    userId: string;
    username: string;
    photoUrl: string;
  };
  title: string;
  rate: number;
  content: string;
  origin: string;
  likes: Schema.Types.ObjectId[];
  images: { publicId: string; url: string }[];
  buyVeridied: boolean;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema(
  {
    customer: {
      userId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      photoUrl: {
        type: String,
        required: true,
      },
    },
    title: {
      type: String,
      required: true,
      minLength: [2, 'title must be at least 2 characters long'],
      maxLength: [100, 'title must be at most 100 characters long'],
      index: true,
      text: true,
    },
    rate: {
      type: Number,
      required: true,
      min: [0, 'rate cannot be lower than 0'],
      max: [5, 'react cannot be greater than 5'],
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    origin: {
      type: String,
      required: true,
    },
    likes: [Schema.Types.ObjectId],
    images: [
      {
        publicId: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    buyVeridied: {
      type: Boolean,
      required: true,
      default: false,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
  },
  { timestamps: true }
);

export default model<IComment>('Comment', commentSchema);
