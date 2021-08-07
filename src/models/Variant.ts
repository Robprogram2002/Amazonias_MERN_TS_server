import { Schema } from 'mongoose';

export interface IVariant {
  basePrice: number;
  currency: string;
  sku: string;
  stock: number;
  sold: number;
  images: {
    publicId: string;
    url: string;
  }[];
  sale: {
    onSale: boolean;
    saleAmount: number;
    expiry: Date;
  };
  availability: string;
  state: string;
  condition: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema(
  {
    basePrice: {
      type: Number,
      required: true,
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
    sku: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
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
    options: [
      {
        type: String,
        required: true,
        index: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default variantSchema;
