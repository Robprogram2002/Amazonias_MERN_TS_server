import { model, Schema } from 'mongoose';
import variantSchema, { IVariant } from './Variant';

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
  }[];
  features: string[];
  specifications: {
    name: string;
    value: string;
  }[];
  sale: {
    onSale: boolean;
    saleAmount: number;
    expiry: Date;
  };
  departmentId: any;
  categoryId: any;
  subs: any[];
  availability: string;
  state: string;
  condition: string;
  brand: string;
  details: string;
  variants:
    | {
        name: string;
        options: string[];
      }[]
    | null;
  productVariants: IVariant[] | null;
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
        values: ['simple', 'variant', 'intengible'],
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
      // text: true,
      // minLength: [50, 'Description must be at least 50 characters long'],
      // required: true,
    },
    sku: {
      type: String,
      // unique : true,
      // check in controller action that  this field is unique
    },
    stock: {
      type: Number,
      //   required: true,
      min: [0, 'Stock must be greater than or equal to 0'],
    },
    sold: {
      type: Number,
      default: 0,
      min: [0, 'sold must be greater than or equal to 0'],
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
    specifications: [
      {
        name: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],
    sale: {
      onSale: {
        type: Boolean,
        required: true,
        default: false,
      },
      saleAmount: {
        type: Number,
      },
      expiry: {
        type: Date,
      },
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
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
        values: ['active', 'not-active', 'removed'],
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
    variants: [
      {
        name: { type: String, requierd: true },
        options: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],
    productVariants: [variantSchema],
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
