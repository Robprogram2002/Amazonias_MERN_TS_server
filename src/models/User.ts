import { Schema, model } from 'mongoose';

type ShippingAdressType = {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  zip: string;
  address: string;
  secondAddress: string;
  description?: string;
};

type ShopCart = {
  products: { product: any; count: number }[];
  totalAmount: number;
  coupon: {
    appliedCoupon: boolean;
    identifier: string;
  };
};

export interface IUser {
  _id: any;
  username: string;
  email: string;
  password: string | null;
  emailVerified: boolean;
  authProvider: string;
  photoUrl: string;
  shippingAddresses: ShippingAdressType[];
  resetPassword: any;
  role: string;
  cart: ShopCart;
  payment: {
    customerId?: string;
    methods?: string[];
  };
  searchHistory: {
    text: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'must there a userName'],
      trim: true,
      minLength: [3, 'to short name'],
      maxLength: [50, 'too long name'],
    },
    email: {
      type: String,
      required: [true, 'must there an valid email'],
      unique: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      trim: true,
      minLength: [8, 'password must be at least 8 characters long'],
      maxLength: [100, 'too long password'],
    },
    emailVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    authProvider: {
      type: String,
      required: true,
      enum: {
        values: ['local', 'google', 'facebook'],
        message: '{VALUE} is not supported like an auth provider',
      },
    },
    photoUrl: {
      type: String,
      default:
        'https://thumbs.dreamstime.com/z/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg',
    },
    shippingAddresses: [
      {
        fname: {
          type: String,
          required: true,
        },
        lname: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          required: true,
        },
        country: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        zip: {
          type: String,
          required: true,
        },
        address: {
          type: String,
          required: true,
        },
        secondAddress: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
      },
    ],
    resetPassword: {
      type: Schema.Types.ObjectId,
      ref: 'Reset',
    },
    role: {
      type: String,
      enum: {
        values: ['customer', 'Admin'],
        message: '{VALUE} is not supported like a user role',
      },
      default: 'customer',
      required: true,
    },
    cart: {
      products: [
        {
          product: { type: Schema.Types.ObjectId, ref: 'Product' },
          count: {
            type: Number,
            min: [0, 'count cannot be negative'],
          },
        },
      ],
      totalAmount: {
        type: Number,
        min: [0, 'Total amount cannot be negative'],
        default: 0,
      },
      coupon: {
        appliedCoupon: {
          type: Boolean,
          default: false,
        },
        identifier: {
          type: String,
        },
      },
    },
    payment: {
      customerId: {
        type: String,
      },
      methods: [String],
    },
    searchHistory: [
      {
        text: {
          type: String,
          required: true,
          unique: true,
        },
        createdAt: {
          type: Schema.Types.Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model<IUser>('User', userSchema);
