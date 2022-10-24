import mongoose from 'mongoose';
import { NODE_ENV } from '../config/VARS.js';
import { Post } from './post.model.js';
import { Reaction } from './reaction.model.js';

const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Types;

export const michaelScottId =
  NODE_ENV === 'production' ? '63493a0684e23607bcf37abb' : '6352bc4e6e4cd057299ec010';

export const dwightId =
  NODE_ENV === 'production' ? '63495640ae09b99a7e08cb0b' : '634948460ec050e4770551b3';

const userSchema = new Schema(
  {
    first_name: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      text: true,
      // validate(value) {
      //   if(!validator.isAlpha(value)){
      //     throw new Error('First name must be letters only')
      //   }
      // }
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
      unique: true,
      lowercase: true,
      trim: true,
      // validate(value) {
      //   if (!validator.isEmail(value)) {
      //     throw new Error('Email is invalid');
      //   }
      // },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (value.length < (NODE_ENV === 'production' ? 8 : 4)) {
          throw new Error('Password must be at least 99 characters');
        }
      },
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
    friends: {
      type: [String],
      ref: 'User',
      default: [michaelScottId],
    },

    followers: {
      type: [String],
      ref: 'User',
      default: [michaelScottId, dwightId],
    },
    following: {
      type: [String],
      ref: 'User',
      default: [michaelScottId],
    },
    requestsReceived: {
      type: [String],
      ref: 'User',
      default: [dwightId],
    },
    requestsSent: {
      type: [String],
      ref: 'User',
    },
    // requestsSent: [{ type: String, ref: 'User' }], // This saves strings. The other option saves ObjectId(s)
    search: [
      {
        user: {
          type: ObjectId,
          ref: 'User',
        },
      },
    ],
    bio: {
      type: String,
      default: '',
    },
    details: {
      // nickName: {
      //   type: String,
      //   default: '',
      // },
      workAndEducation: {
        work: {
          job: {
            type: String,
            default: '',
            // visibilty: {
            //   type: String,
            //   enum: ['public', 'friends', 'private'],
            //   default: 'public',
            // },
          },
          workPlace: {
            type: String,
            default: "McDonald's",
          },
        },
        education: {
          college: {
            type: String,
            default: '',
          },
          highSchool: {
            type: String,
            default: '',
          },
        },
      },
      placesLived: {
        currentCity: {
          type: String,
          default: '',
        },
        hometown: {
          type: String,
          default: '',
        },
      },
      familyAndRelationships: {
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
        familyMembers: {
          type: [ObjectId],
          ref: 'User',
          // default: [michaelScottId],
          relationship: {
            type: String,
            enum: [
              'father',
              'mother',
              'brother',
              'sister',
              'son',
              'daughter',
              'husband',
              'wife',
              'cuusin',
              'aunt',
              'uncle',
              'grandfather',
              'grandmother',
            ],
          },
        },
      },
      socialMedia: {
        instagram: {
          type: String,
          default: '',
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
  },
  // auto-creates: createdAt: Date, updatedAt: Date
  { timestamps: true }
);

userSchema.pre('deleteOne', function (next) {
  // userSchema.pre('deleteOne', { query: false, document: true }, function (next) {
  const userId = this._conditions._id;
  // Remove all the posts and reactions that reference (are created by) the removed person.
  Post.deleteMany({ user: userId });
  Reaction.deleteMany({ user: userId }, next);
});

export const User = mongoose.model('User', userSchema);
