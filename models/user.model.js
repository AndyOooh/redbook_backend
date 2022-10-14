import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Types;

const michaelScottId = '';

const userSchema = new Schema(
  {
    first_name: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      text: true,
    },
    last_name: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      text: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      text: true,
      unique: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      text: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    pictures: {
      type: Array,
      default: [
        {
          id: 'default_image',
          url: 'https://res.cloudinary.com/dy5zg2sdz/image/upload/v1663082857/redbook/default_profile_redbook_qmw852.png',
          usedBefore: true,
        },
      ],
    },
    covers: {
      type: Array,
      default: [
        {
          id: 'default_image',
          url: 'https://res.cloudinary.com/dy5zg2sdz/image/upload/v1663334142/redbook/default_cover_redbook__E4E6EB_cle5gj.png',
          usedBefore: true,
        },
      ],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      trim: true,
    },
    birth_year: {
      type: Number,
      required: true,
      trim: true,
    },
    birth_month: {
      type: Number,
      required: true,
      trim: true,
    },
    birth_date: {
      type: Number,
      required: true,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    accessToken: {
      type: String,
    },
    friends: [{ type: String, ref: 'User' }],
    followers: [{ type: String, ref: 'User' }],
    following: [{ type: String, ref: 'User' }],
    requestsReceived: [{ type: String, ref: 'User' }],
    requestsSent: [{ type: String, ref: 'User' }],
    search: [
      {
        user: {
          type: ObjectId,
          ref: 'User',
        },
      },
    ],
    details: {
      bio: {
        type: String,
        default: '',
      },
      otherName: {
        type: String,
        default: '',
      },
      job: {
        type: String,
        default: '',
      },
      workPlace: {
        type: String,
        default: "McDonald's",
      },
      highSchool: {
        type: String,
        default: '',
      },
      college: {
        type: String,
        default: '',
      },
      currentCity: {
        type: String,
        default: '',
      },
      hometown: {
        type: String,
        default: '',
      },
      relationshipStatus: {
        type: String,
        enum: [
          'Single',
          'In a relationship',
          'Engaged',
          'Divorced',
          'Married',
          "It's Complicated",
          'Prefer not to say',
          '',
        ],
        default: '',
      },
      instagram: {
        type: String,
        default: '',
      },
    },
    savedPosts: [
      {
        post: {
          type: ObjectId,
          ref: 'Post',
        },
        savedAt: {
          type: Date,
          default: Date.now, // course: new Date()
        },
      },
    ],
  },
  // auto-creates: createdAt: Date, updatedAt: Date
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
