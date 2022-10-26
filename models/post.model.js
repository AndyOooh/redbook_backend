import mongoose from 'mongoose';
import { Reaction } from './reaction.model.js';

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types; //could be mongoose.Schema

const postsSchema = new Schema(
  {
    _id: ObjectId, // becaue we need t create it beforehand, so we cna use it in cloudinary.
    type: {
      type: String,
      enum: ['profile', 'cover', 'feed', null],
      default: null,
    },
    text: String,
    images: Array,
    user: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    background: {
      type: String || null,
      default: null,
    },
    comments: [
      {
        _id: ObjectId,
        text: {
          type: String,
        },
        images: [
          {
            id: String,
            url: String,
          },
        ],
        commentBy: {
          type: ObjectId,
          ref: 'User',
        },
        commentAt: {
          type: Date,
          default: new Date(),
        },
      },
    ],
    reactions: {
      type: [ObjectId],
      ref: 'Reaction',
    },
  },
  {
    timestamps: true,
  }
);

// remember to get the correct methods here
postsSchema.pre('deleteOne', function (next) {
  const postId = this._conditions._id;
  Reaction.deleteMany({ post: postId }, next);
});

export const Post = mongoose.model('Post', postsSchema);
