import { model, Schema } from 'mongoose';

export interface IProduct {
  title: string;
  slug: string;
  type: string;
  basePrice: number;
  currency: string;
  description: string;
  sku: string;
  stock: number;
  images: {
    publicId: string;
    url: string;
  };
  features: string[];
  sale: {
    onSale: boolean;
    saleAmount: number;
    expiry: Date;
  };
  categoryId: any;
  subs: any[];
  availability: string;
  state: string;
  condition: string;
  brand: string;
  details: string;
  ratings: {
    star: number;
    postedBy: any;
  }[];
  questions: any[];
  comments: any[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: [4, 'Too short name'],
      maxLength: [70, 'Too long name'],
      unique: true,
      text: true,
    },
    slug: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    type: {
      type: String,
      enum: {
        values: ['simple', 'variants', 'intengible'],
        message: '{VALUE} is not supported like a product type',
      },
    },
    basePrice: {
      type: Number,
      //   required: true,
      min: [0, 'price must be greater than 0'],
      index: true,
    },
    currency: {
      type: String,
      enum: {
        values: ['USD', 'MXN', 'EUR'],
        message: '{VALUE} is not supported like a currency option',
      },
    },
    description: {
      type: String,
      text: true,
      minLength: [50, 'Description must be at least 50 characters long'],
      required: true,
    },
    sku: {
      type: String,
      //   required: true,
      unique: true,
    },
    stock: {
      type: Number,
      //   required: true,
      min: [0, 'Stock must be greater than or equal to 0'],
    },
    images: [
      {
        publicId: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    features: [String],
    sale: {
      onSale: {
        type: Boolean,
        required: true,
      },
      saleAmount: {
        type: Number,
        required: true,
      },
      expiry: {
        type: Date,
        required: true,
      },
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    subs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true,
      },
    ],
    // vendor: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'Vendor',
    //   required: true,
    // },
    availability: {
      type: String,
      enum: {
        values: ['in stock', 'out of stock', 'pre-order', 'backorder'],
        message: '{VALUE} is not supported like a product availability option',
      },
    },
    state: {
      type: String,
      enum: {
        values: ['active', 'paused', 'removed'],
        message: '{VALUE} is not supported like a product condition option',
      },
    },
    condition: {
      type: String,
      enum: {
        values: ['new', 'used', 'refurbished', 'repared'],
        message: '{VALUE} is not supported like a product condition option',
      },
    },
    brand: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    // extraDetails: [
    //   {
    //     name: { type: String, required: true },
    //     value: { type: String, required: true },
    //   },
    // ],
    ratings: [
      {
        star: {
          type: Number,
          required: true,
        },
        postedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model<IProduct>('Product', productSchema);
