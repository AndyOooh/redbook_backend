import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Types; //could be mongoose.Schema

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
    friends: [{ type: String, ref: 'User', unique: true }],
    followers: [{ type: String, ref: 'User', unique: true }],
    following: [{ type: String, ref: 'User', unique: true }],
    requestsReceived: [{ type: String, ref: 'User', unique: true }],
    requestsSent: [{ type: String, ref: 'User', unique: true }],
    // following: [],
    // followers: [],
    // requestsReceived: [],
    // requestsSent: [],

    // friends: [{ type: ObjectId, ref: 'User', unique: false }],
    // following: [{ type: ObjectId, ref: 'User', unique: false }],
    // followers: [{ type: ObjectId, ref: 'User', unique: false }],
    // requestsReceived: [{ type: ObjectId, ref: 'User', unique: false }],
    // requestsSent: [{ type: ObjectId, ref: 'User', unique: false }],
    // friends: {
    //   type: Array,
    //   // test if unique works for elements inside the array, If so, add to all others
    //   // unique: true,
    //   ref: 'User',
    //   // default: '6341ec2090986e8cc3e99edd',
    // },
    // following: {
    //   type: Array,
    //   // unique: true,
    //   ref: 'User',
    //   // default: '6341ec2090986e8cc3e99edd',
    // },
    // followers: {
    //   type: Array,
    //   // unique: true,
    //   ref: 'User',
    //   // default: '6341ec2090986e8cc3e99edd',
    // },
    // requestsReceived: {
    //   type: Array,
    //   // unique: true,
    //   ref: 'User',
    //   // default: '6341eaf5108b5d7552649acb',
    // },
    // requestsSent: {
    //   type: Array,
    //   // unique: true,
    //   ref: 'User',
    //   default: [''],
    // },
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
    // auto-creates: createdAt: Date, updatedAt: Date
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
