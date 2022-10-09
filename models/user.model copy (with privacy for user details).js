import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types; //could be mongoose.Schema

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
          // url: 'https://res.cloudinary.com/dmhcnhtng/image/upload/v1643044376/avatars/default_pic_jeaybr.png',
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
          // url: 'https://www.freeiconspng.com/img/20606">Icon Drawing Upload',
          // url: 'https://res.cloudinary.com/dy5zg2sdz/image/upload/v1663082074/redbook/default_cover_redbook_qzcgqb.png',
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
    friends: {
      type: Array,
      default: [],
    },
    following: {
      type: Array,
      default: [],
    },
    followers: {
      type: Array,
      default: [],
    },
    requests: {
      type: Array,
      default: [],
    },
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
        value: {
          type: String,
          default: '',
        },
        visibility: {
          type: String,
          enum: ['public', 'friends', 'private'],
          default: 'public',
        },
      },
      otherName: {
        value: {
          type: String,
          default: '',
        },
        visibility: {
          type: String,
          enum: ['public', 'friends', 'private'],
          default: 'private',
        },
      },
      job: {
        value: {
          type: String,
          default: '',
        },
        visibility: {
          type: String,
          enum: ['public', 'friends', 'private'],
          default: 'private',
        },
      },
      workPlace: {
        value: {
          type: String,
          default: "McDonald's",
        },
        visibility: {
          type: String,
          enum: ['public', 'friends', 'private'],
          default: 'private',
        },
      },
      highSchool: {
        value: {
          type: String,
          default: '',
        },
        visibility: {
          type: String,
          enum: ['public', 'friends', 'private'],
          default: 'private',
        },
      },
      college: {
        value: {
          type: String,
          default: '',
        },
        visibility: {
          type: String,
          enum: ['public', 'friends', 'private'],
          default: 'private',
        },
      },
      currentCity: {
        value: {
          type: String,
          default: '',
        },
        visibility: {
          type: String,
          enum: ['public', 'friends', 'private'],
          default: 'private',
        },
      },
      hometown: {
        value: {
          type: String,
          default: '',
        },
        visibility: {
          type: String,
          enum: ['public', 'friends', 'private'],
          default: 'private',
        },
      },
      relationshipStatus: {
        value: {
          type: String,
          enum: ['single', 'in a relationship', 'engaged', 'married', 'complicated', ''],
          default: '',
        },
        visibility: {
          type: String,
          enum: ['public', 'friends', 'private'],
          default: 'private',
        },
      },
      instaGram: {
        value: {
          type: String,
          default: '',
        },
        visibility: {
          type: String,
          enum: ['public', 'friends', 'private'],
          default: 'private',
        },
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
    // auto-creates: createdAt: Date, updatedAt: Date
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);