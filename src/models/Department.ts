import { Schema, model } from 'mongoose';
import slugify from 'slugify';

export interface IDepartment {
  name: string;
  banners: { publicId: string; url: string }[];
  createdAt: Date;
  updatedAt: Date;
  slug: string;
}

const departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [4, 'Too short name'],
      maxLength: [70, 'Too long name'],
      index: true,
      unique: true,
    },
    banners: [
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
    slug: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

// departmentSchema
//   .virtual('slug')
//   .get((schema: IDepartment) => slugify(schema.name));

// userSchema.plugin(mongooseLeanVirtuals);

// UserSchema.pre<Query<IUser>>('findOne', function () {
//   // Prints "{ email: 'bill@microsoft.com' }"
//   console.log(this.getFilter());
// });

departmentSchema.pre<IDepartment>('save', function () {
  const doc = this;
  doc.slug = slugify(doc.name);
});

export default model<IDepartment>('Department', departmentSchema);
